<?php

namespace App\Actions\EducationalVideo;

use App\Enums\VideoStatus;
use App\Jobs\EducationalVideo\BuildRenderManifestJob;
use App\Jobs\EducationalVideo\GenerateStoryboardJob;
use App\Jobs\EducationalVideo\IllustrateSlidesJob;
use App\Jobs\EducationalVideo\NarrateSlidesJob;
use App\Jobs\EducationalVideo\RenderEducationalVideoJob;
use App\Models\EducationalVideo;
use Illuminate\Support\Facades\Bus;
use Illuminate\Support\Facades\Log;
use Throwable;

class QueueVideoGenerationAction
{
    /**
     * Dispatch the full generation pipeline as a chain of queued jobs. If any job in the
     * chain ultimately fails (after retries are exhausted), the video is marked failed
     * from this single place instead of every step handling its own failure.
     */
    public function handle(EducationalVideo $video): void
    {
        Bus::chain([
            new GenerateStoryboardJob($video),
            new NarrateSlidesJob($video),
            new IllustrateSlidesJob($video),
            new BuildRenderManifestJob($video),
            new RenderEducationalVideoJob($video),
        ])->catch(function (Throwable $e) use ($video): void {
            Log::error("[EducationalVideo #{$video->id}] Generation failed", [
                'message' => $e->getMessage(),
                'exception' => $e::class,
            ]);

            EducationalVideo::find($video->id)?->update([
                'status' => VideoStatus::Failed,
                'error' => $e->getMessage(),
                'progress' => null,
            ]);
        })->dispatch();
    }
}
