<?php

namespace Tests\Feature;

use App\Actions\EducationalVideo\RetryVideoGenerationAction;
use App\Enums\VideoStatus;
use App\Jobs\EducationalVideo\BuildRenderManifestJob;
use App\Jobs\EducationalVideo\GenerateStoryboardJob;
use App\Jobs\EducationalVideo\IllustrateSlidesJob;
use App\Jobs\EducationalVideo\NarrateSlidesJob;
use App\Jobs\EducationalVideo\RenderEducationalVideoJob;
use App\Models\EducationalVideo;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Bus;
use Tests\TestCase;

/**
 * A retry should resume only from whatever stage hasn't already succeeded, inferred from
 * which columns are already populated on the video.
 */
class RetryVideoGenerationActionTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_dispatches_the_full_chain_when_no_storyboard_exists()
    {
        Bus::fake();

        $video = EducationalVideo::factory()->failed()->create(['storyboard' => null]);

        (new RetryVideoGenerationAction)->handle($video);

        $video->refresh();
        $this->assertNull($video->error);
        $this->assertSame(VideoStatus::GeneratingStoryboard, $video->status);

        Bus::assertChained([
            GenerateStoryboardJob::class,
        ]);
    }

    public function test_it_resumes_from_narration_when_storyboard_exists_but_no_audio_manifest()
    {
        Bus::fake();

        $video = EducationalVideo::factory()->failed()->create([
            'storyboard' => ['title' => 'T', 'summary' => 'S', 'slides' => []],
            'audio_manifest' => null,
        ]);

        (new RetryVideoGenerationAction)->handle($video);

        $this->assertSame(VideoStatus::GeneratingAudio, $video->refresh()->status);

        Bus::assertChained([
            NarrateSlidesJob::class,
            IllustrateSlidesJob::class,
            BuildRenderManifestJob::class,
            RenderEducationalVideoJob::class,
        ]);
    }

    public function test_it_resumes_from_illustration_when_narration_ran_but_illustration_did_not()
    {
        Bus::fake();

        $video = EducationalVideo::factory()->failed()->create([
            'storyboard' => ['title' => 'T', 'summary' => 'S', 'slides' => []],
            'audio_manifest' => [
                ['index' => 0, 'heading' => 'Welcome', 'audioPath' => 'audio/0.mp3'],
            ],
        ]);

        (new RetryVideoGenerationAction)->handle($video);

        $this->assertSame(VideoStatus::GeneratingAudio, $video->refresh()->status);

        Bus::assertChained([
            IllustrateSlidesJob::class,
            BuildRenderManifestJob::class,
            RenderEducationalVideoJob::class,
        ]);
    }

    public function test_it_resumes_from_rendering_when_narration_and_illustration_already_ran()
    {
        Bus::fake();

        $video = EducationalVideo::factory()->failed()->create([
            'storyboard' => ['title' => 'T', 'summary' => 'S', 'slides' => []],
            'audio_manifest' => [
                ['index' => 0, 'heading' => 'Welcome', 'audioPath' => 'audio/0.mp3', 'imagePath' => null],
            ],
        ]);

        (new RetryVideoGenerationAction)->handle($video);

        $this->assertSame(VideoStatus::Rendering, $video->refresh()->status);

        Bus::assertChained([
            BuildRenderManifestJob::class,
            RenderEducationalVideoJob::class,
        ]);
    }
}
