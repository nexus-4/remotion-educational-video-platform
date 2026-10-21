<?php

namespace Tests\Feature;

use App\Actions\EducationalVideo\ContinueVideoGenerationAction;
use App\Actions\EducationalVideo\QueueVideoGenerationAction;
use App\Ai\Agents\StoryboardWriter;
use App\Enums\AnimationStyle;
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
    private function fakeInteractiveStoryboard(): array
    {
        return [
            ...$this->fakeStoryboard(),
            'checkpoint' => [
                'afterSlideIndex' => 1,
                'question' => 'What causes evaporation?',
                'options' => ['The sun heating water', 'The moon pulling water'],
                'correctOptionIndex' => 0,
                'remediationHeading' => 'Let\'s try again',
                'remediationNarration' => 'Heat from the sun warms water until it turns into vapor.',
                'remediationImagePrompt' => 'A simple flat illustration of steam rising from a warm puddle.',
            ],
        ];
    }

    /**
     * A `Process::fake` handler that writes fake bytes to whatever output path each Remotion
     * CLI invocation was given (main video, remediation clip, or thumbnail), and returns a
     * fake duration for `ffprobe` calls used by `ComputeSlideTimingsAction`.
     */
    private function fakeProcessHandler(): \Closure
    {
        return function ($process) {
            if (($process->command[0] ?? null) === 'ffprobe') {
                return '5';
            }

            $outputRelativePath = $process->command[3] ?? null;

            if ($outputRelativePath !== null) {
                File::put("{$this->remotionPath}/{$outputRelativePath}", 'fake-bytes');
            }

            return 0;
        };
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
            'animation_style' => AnimationStyle::PopIn,
        ]);

        Storage::disk('local')->put($video->source_pdf_path, 'fake-pdf-bytes');

        StoryboardWriter::fake([$this->fakeStoryboard()]);
        Audio::fake();
        Image::fake();

        Process::fake(function ($process) use ($video) {
            $filename = ($process->command[1] ?? '') === 'still'
                ? "{$video->id}-thumb.jpg"
                : "{$video->id}.mp4";

            File::put("{$this->remotionPath}/out/{$filename}", 'fake-bytes');

            return 0;
        });

        (new QueueVideoGenerationAction)->handle($video);

        $video->refresh();

        $this->assertSame(VideoStatus::AwaitingReview, $video->status);

        (new ContinueVideoGenerationAction)->handle($video);

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
        $this->assertSame('pop_in', $manifest['animationStyle']);
        $this->assertNull($manifest['logoFile']);

        Process::assertRan(fn ($process) => str_ends_with($process->command[0] ?? '', '/node_modules/.bin/remotion'));
    }

    public function test_it_includes_the_institution_logo_in_the_render_manifest()
    {
        Storage::fake('local');
        Storage::fake('public');

        $video = EducationalVideo::factory()->create([
            'source_pdf_path' => 'educational-videos/pdfs/lesson.pdf',
            'logo_path' => 'educational-videos/logos/school-logo.png',
        ]);

        Storage::disk('local')->put($video->source_pdf_path, 'fake-pdf-bytes');
        Storage::disk('local')->put('educational-videos/logos/school-logo.png', 'fake-logo-bytes');

        StoryboardWriter::fake([$this->fakeStoryboard()]);
        Audio::fake();
        Image::fake();
        Process::fake($this->fakeProcessHandler());

        (new QueueVideoGenerationAction)->handle($video);
        (new ContinueVideoGenerationAction)->handle($video->refresh());

        $video->refresh();

        $this->assertSame(VideoStatus::Completed, $video->status);

        $manifest = json_decode(File::get("{$this->remotionPath}/public/generated/{$video->id}/manifest.json"), true);
        $this->assertSame('logo.png', $manifest['logoFile']);
        $this->assertSame('fake-logo-bytes', File::get("{$this->remotionPath}/public/generated/{$video->id}/logo.png"));
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

        Process::fake(function ($process) use ($video) {
            $filename = ($process->command[1] ?? '') === 'still'
                ? "{$video->id}-thumb.jpg"
                : "{$video->id}.mp4";

            File::put("{$this->remotionPath}/out/{$filename}", 'fake-bytes');

            return 0;
        });

        (new QueueVideoGenerationAction)->handle($video);
        (new ContinueVideoGenerationAction)->handle($video->refresh());

        $video->refresh();

        $this->assertSame(VideoStatus::Completed, $video->status);
        $this->assertNull($video->audio_manifest[0]['imagePath']);

        $manifest = json_decode(File::get("{$this->remotionPath}/public/generated/{$video->id}/manifest.json"), true);
        $this->assertNull($manifest['slides'][0]['imageFile']);
    }

    public function test_it_uses_an_assigned_user_photo_instead_of_generating_an_illustration_for_that_slide()
    {
        Storage::fake('local');
        Storage::fake('public');

        $video = EducationalVideo::factory()->create([
            'source_pdf_path' => 'educational-videos/pdfs/lesson.pdf',
            'user_photos' => ['educational-videos/user-photos/classroom.jpg'],
        ]);

        Storage::disk('local')->put($video->source_pdf_path, 'fake-pdf-bytes');
        Storage::disk('public')->put('educational-videos/user-photos/classroom.jpg', 'real-photo-bytes');

        StoryboardWriter::fake([$this->fakeStoryboard()]);
        Audio::fake();
        Image::fake();
        Process::fake($this->fakeProcessHandler());

        (new QueueVideoGenerationAction)->handle($video);

        $video->refresh();
        $storyboard = $video->storyboard;
        $storyboard['slides'][1]['userPhotoPath'] = 'educational-videos/user-photos/classroom.jpg';
        $storyboard['slides'][1]['imagePrompt'] = null;
        $video->update(['storyboard' => $storyboard]);

        (new ContinueVideoGenerationAction)->handle($video->refresh());

        $video->refresh();

        $this->assertSame(VideoStatus::Completed, $video->status);

        // The photo-assigned slide got the uploaded photo's bytes, not an AI illustration.
        $this->assertSame('real-photo-bytes', Storage::disk('local')->get($video->audio_manifest[1]['imagePath']));

        // The other slide (intro) was still illustrated normally by the AI.
        $this->assertNotNull($video->audio_manifest[0]['imagePath']);
        Image::assertGenerated(fn ($prompt): bool => str_contains($prompt->prompt, 'water droplet'));
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

        (new QueueVideoGenerationAction)->handle($video);

        try {
            (new ContinueVideoGenerationAction)->handle($video->refresh());
            $this->fail('Expected the pipeline to throw when rendering fails.');
        } catch (\Throwable) {
            // Expected: with the `sync` queue driver used in testing, the failed job's
            // exception is rethrown to the caller after the chain's `catch()` callback runs.
        }

        $video->refresh();

        $this->assertSame(VideoStatus::Failed, $video->status);
        $this->assertNotNull($video->error);
    }

    public function test_it_generates_a_remediation_clip_and_slide_timings_for_an_interactive_video()
    {
        Storage::fake('local');
        Storage::fake('public');

        $video = EducationalVideo::factory()->create([
            'source_pdf_path' => 'educational-videos/pdfs/lesson.pdf',
            'interactive' => true,
            'logo_path' => 'educational-videos/logos/school-logo.png',
        ]);

        Storage::disk('local')->put($video->source_pdf_path, 'fake-pdf-bytes');
        Storage::disk('local')->put('educational-videos/logos/school-logo.png', 'fake-logo-bytes');

        StoryboardWriter::fake([$this->fakeInteractiveStoryboard()]);
        Audio::fake();
        Image::fake();
        Process::fake($this->fakeProcessHandler());

        (new QueueVideoGenerationAction)->handle($video);

        $video->refresh();

        $this->assertArrayNotHasKey('checkpoint', $video->storyboard);
        $this->assertSame(0, $video->interactive_checkpoint['correctOptionIndex']);

        (new ContinueVideoGenerationAction)->handle($video);

        $video->refresh();

        $this->assertSame(VideoStatus::Completed, $video->status);
        $this->assertNull($video->progress);
        $this->assertNotNull($video->video_path);
        Storage::disk('public')->assertExists($video->video_path);

        // The main video's own assets are untouched, at their normal (non-suffixed) path.
        $this->assertFileExists("{$this->remotionPath}/public/generated/{$video->id}/manifest.json");

        // The remediation clip is rendered and stored independently, under a distinct id.
        $this->assertNotNull($video->remediation_video_path);
        Storage::disk('public')->assertExists($video->remediation_video_path);
        $this->assertFileExists("{$this->remotionPath}/public/generated/{$video->id}-remediation/manifest.json");
        $this->assertFileExists("{$this->remotionPath}/public/generated/{$video->id}-remediation/audio/slide-0.mp3");
        $this->assertFileExists("{$this->remotionPath}/public/generated/{$video->id}-remediation/images/slide-0.png");

        $remediationManifest = json_decode(File::get("{$this->remotionPath}/public/generated/{$video->id}-remediation/manifest.json"), true);
        $this->assertSame("Let's try again", $remediationManifest['title']);
        $this->assertCount(1, $remediationManifest['slides']);

        // The remediation clip carries the same institution logo as the main video.
        $this->assertSame('logo.png', $remediationManifest['logoFile']);
        $this->assertSame('fake-logo-bytes', File::get("{$this->remotionPath}/public/generated/{$video->id}-remediation/logo.png"));

        $this->assertCount(2, $video->slide_timings);
        $this->assertEquals(0, $video->slide_timings[0]['startSeconds']);
        $this->assertGreaterThan($video->slide_timings[0]['startSeconds'], $video->slide_timings[0]['endSeconds']);
        $this->assertEquals($video->slide_timings[0]['endSeconds'], $video->slide_timings[1]['startSeconds']);
    }

    public function test_a_non_interactive_video_never_gets_a_checkpoint_remediation_clip_or_slide_timings()
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
        Process::fake($this->fakeProcessHandler());

        (new QueueVideoGenerationAction)->handle($video);
        (new ContinueVideoGenerationAction)->handle($video->refresh());

        $video->refresh();

        $this->assertFalse($video->interactive);
        $this->assertNull($video->interactive_checkpoint);
        $this->assertNull($video->remediation_video_path);
        $this->assertNull($video->slide_timings);
        $this->assertDirectoryDoesNotExist("{$this->remotionPath}/public/generated/{$video->id}-remediation");
    }

    public function test_a_failed_remediation_clip_does_not_fail_an_otherwise_completed_interactive_video()
    {
        Storage::fake('local');
        Storage::fake('public');

        $video = EducationalVideo::factory()->create([
            'source_pdf_path' => 'educational-videos/pdfs/lesson.pdf',
            'interactive' => true,
        ]);

        Storage::disk('local')->put($video->source_pdf_path, 'fake-pdf-bytes');

        StoryboardWriter::fake([$this->fakeInteractiveStoryboard()]);
        Audio::fake();
        Image::fake();

        Process::fake(function ($process) {
            $outputRelativePath = $process->command[3] ?? null;

            if ($outputRelativePath !== null && str_contains($outputRelativePath, 'remediation')) {
                return 1;
            }

            if (($process->command[0] ?? null) === 'ffprobe') {
                return '5';
            }

            if ($outputRelativePath !== null) {
                File::put("{$this->remotionPath}/{$outputRelativePath}", 'fake-bytes');
            }

            return 0;
        });

        (new QueueVideoGenerationAction)->handle($video);
        (new ContinueVideoGenerationAction)->handle($video->refresh());

        $video->refresh();

        $this->assertSame(VideoStatus::Completed, $video->status);
        $this->assertNull($video->error);
        $this->assertNotNull($video->video_path);
        $this->assertNull($video->remediation_video_path);
    }

    public function test_it_generates_a_video_from_a_topic_with_no_source_document()
    {
        Storage::fake('local');
        Storage::fake('public');

        $video = EducationalVideo::factory()->create([
            'source_pdf_path' => null,
            'topic' => 'The water cycle and how rain forms',
        ]);

        StoryboardWriter::fake([$this->fakeStoryboard()]);
        Audio::fake();
        Image::fake();

        Process::fake(function ($process) use ($video) {
            $filename = ($process->command[1] ?? '') === 'still'
                ? "{$video->id}-thumb.jpg"
                : "{$video->id}.mp4";

            File::put("{$this->remotionPath}/out/{$filename}", 'fake-bytes');

            return 0;
        });

        (new QueueVideoGenerationAction)->handle($video);
        (new ContinueVideoGenerationAction)->handle($video->refresh());

        $video->refresh();

        $this->assertSame(VideoStatus::Completed, $video->status);
        $this->assertNotNull($video->video_path);

        StoryboardWriter::assertPrompted(fn ($prompt): bool => $prompt->attachments->isEmpty()
            && str_contains($prompt->prompt, 'The water cycle and how rain forms'));
    }
}
