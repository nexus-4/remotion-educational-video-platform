<?php

namespace App\Actions\EducationalVideo\Concerns;

use App\Enums\VideoStatus;
use App\Models\EducationalVideo;
use Closure;
use Illuminate\Support\Facades\Log;
use Throwable;

trait CatchesChainFailures
{
    /**
     * Build the chain-level `catch` closure that marks a video failed once a job in its
     * generation chain exhausts its retries, instead of every job handling its own failure.
     */
    private function catchChainFailure(EducationalVideo $video): Closure
    {
        return function (Throwable $e) use ($video): void {
            Log::error("[EducationalVideo #{$video->id}] Generation failed", [
                'message' => $e->getMessage(),
                'exception' => $e::class,
            ]);

            EducationalVideo::find($video->id)?->update([
                'status' => VideoStatus::Failed,
                'error' => $e->getMessage(),
                'progress' => null,
            ]);
        };
    }
}
