<?php

namespace Tests\Feature;

use App\Actions\EducationalVideo\QueueVideoGenerationAction;
use App\Ai\Agents\StoryboardWriter;
use App\Enums\VideoStatus;
use App\Models\EducationalVideo;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Process;
use Illuminate\Support\Facades\Storage;
use Laravel\Ai\Audio;
use Laravel\Ai\Image;
use Tests\TestCase;

/**
 * Exercises the full generate-storyboard -> narrate -> illustrate -> build-manifest -> render
 * pipeline exactly as it runs in production: as a chain of queued jobs. The `sync` queue
 * connection used in testing runs the whole chain in-process, so this is a faithful
 * end-to-end test without needing a real queue worker.
 */
class EducationalVideoGenerationPipelineTest extends TestCase
{
    use RefreshDatabase;

    protected string $remotionPath;

    protected function setUp(): void
    {
        parent::setUp();

        $this->remotionPath = sys_get_temp_dir().'/remotion-test-'.uniqid();

        File::ensureDirectoryExists($this->remotionPath.'/out');

        config(['services.remotion.path' => $this->remotionPath]);
    }

    protected function tearDown(): void
    {
        File::deleteDirectory($this->remotionPath);

        parent::tearDown();
    }

    /**
     * @return array<string, mixed>
     */
    private function fakeStoryboard(): array
    {
        return [
            'title' => 'The Water Cycle',
            'summary' => 'How water moves through nature.',
            'slides' => [
                [
                    'type' => 'intro',
                    'heading' => 'Welcome!',
                    'narration' => 'Hello students, today we learn about water.',
                    'bullets' => null,
                    'formula' => null,
                    'highlightTerms' => ['water'],
                    'imagePrompt' => 'A simple flat illustration of a water droplet.',
                ],
                [
                    'type' => 'content',
                    'heading' => 'Evaporation',
                    'narration' => 'The sun heats water until it becomes vapor.',
                    'bullets' => ['Sun heats water', 'Water becomes vapor'],
                    'formula' => null,
                    'highlightTerms' => ['evaporation'],
                    'imagePrompt' => 'A simple flat illustration of the sun heating the ocean.',
                ],
            ],
        ];
    }

    public function test_it_generates_a_storyboard_narration_and_video()
    {
        Storage::fake('local');
        Storage::fake('public');

        $video = EducationalVideo::factory()->create([
            'source_pdf_path' => 'educational-videos/pdfs/lesson.pdf',
        ]);

        Storage::disk('local')->put($video->source_pdf_path, 'fake-pdf-bytes');

        StoryboardWriter::fake([$this->fakeStoryboard()]);
        Audio::fake();
        Image::fake();

        Process::fake(function () use ($video) {
            File::put("{$this->remotionPath}/out/{$video->id}.mp4", 'fake-mp4-bytes');

            return 0;
        });

        (new QueueVideoGenerationAction)->handle($video);

        $video->refresh();

        $this->assertSame(VideoStatus::Completed, $video->status);
        $this->assertNull($video->progress);
        $this->assertSame('The Water Cycle', $video->storyboard['title']);
        $this->assertCount(2, $video->storyboard['slides']);
        $this->assertCount(2, $video->audio_manifest);
        $this->assertNotNull($video->audio_manifest[0]['imagePath']);
        $this->assertNotNull($video->video_path);

        Storage::disk('public')->assertExists($video->video_path);

        $this->assertFileExists("{$this->remotionPath}/public/generated/{$video->id}/manifest.json");
        $this->assertFileExists("{$this->remotionPath}/public/generated/{$video->id}/audio/slide-0.mp3");
        $this->assertFileExists("{$this->remotionPath}/public/generated/{$video->id}/audio/slide-1.mp3");
        $this->assertFileExists("{$this->remotionPath}/public/generated/{$video->id}/images/slide-0.png");
        $this->assertFileExists("{$this->remotionPath}/public/generated/{$video->id}/images/slide-1.png");

        $manifest = json_decode(File::get("{$this->remotionPath}/public/generated/{$video->id}/manifest.json"), true);
        $this->assertSame('images/slide-0.png', $manifest['slides'][0]['imageFile']);

        Process::assertRan(fn ($process) => str_contains($process->command[0] ?? '', 'npx'));
    }

    public function test_it_continues_without_an_illustration_when_image_generation_fails()
    {
        Storage::fake('local');
        Storage::fake('public');

        $video = EducationalVideo::factory()->create([
            'source_pdf_path' => 'educational-videos/pdfs/lesson.pdf',
        ]);

        Storage::disk('local')->put($video->source_pdf_path, 'fake-pdf-bytes');

        StoryboardWriter::fake([$this->fakeStoryboard()]);
        Audio::fake();
        Image::fake(fn () => throw new \RuntimeException('image provider unavailable'));

        Process::fake(function () use ($video) {
            File::put("{$this->remotionPath}/out/{$video->id}.mp4", 'fake-mp4-bytes');

            return 0;
        });

        (new QueueVideoGenerationAction)->handle($video);

        $video->refresh();

        $this->assertSame(VideoStatus::Completed, $video->status);
        $this->assertNull($video->audio_manifest[0]['imagePath']);

        $manifest = json_decode(File::get("{$this->remotionPath}/public/generated/{$video->id}/manifest.json"), true);
        $this->assertNull($manifest['slides'][0]['imageFile']);
    }

    public function test_it_marks_the_video_as_failed_when_rendering_fails()
    {
        Storage::fake('local');
        Storage::fake('public');

        $video = EducationalVideo::factory()->create([
            'source_pdf_path' => 'educational-videos/pdfs/lesson.pdf',
        ]);

        Storage::disk('local')->put($video->source_pdf_path, 'fake-pdf-bytes');

        StoryboardWriter::fake([$this->fakeStoryboard()]);
        Audio::fake();
        Image::fake();

        Process::fake(fn () => 1);

        try {
            (new QueueVideoGenerationAction)->handle($video);
            $this->fail('Expected the pipeline to throw when rendering fails.');
        } catch (\Throwable) {
            // Expected: with the `sync` queue driver used in testing, the failed job's
            // exception is rethrown to the caller after the chain's `catch()` callback runs.
        }

        $video->refresh();

        $this->assertSame(VideoStatus::Failed, $video->status);
        $this->assertNotNull($video->error);
    }
}
