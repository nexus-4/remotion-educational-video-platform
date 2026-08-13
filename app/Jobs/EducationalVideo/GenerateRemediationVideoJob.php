<?php

namespace App\Jobs\EducationalVideo;

use App\Actions\EducationalVideo\ComputeSlideTimingsAction;
use App\Actions\EducationalVideo\GenerateRemediationVideoAction;
use App\Jobs\EducationalVideo\Concerns\IsResilientVideoJob;
use App\Models\EducationalVideo;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Throwable;

class GenerateRemediationVideoJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, IsResilientVideoJob, Queueable, SerializesModels;

    public function __construct(public EducationalVideo $video) {}

    /**
     * Generate the remediation clip. The main video is already fully generated and watchable
     * by the time this job runs, so a failure here is treated as best-effort — it's logged and
     * swallowed rather than failing the chain, which would otherwise mark an already-completed,
     * playable video as failed.
     */
    public function handle(GenerateRemediationVideoAction $action, ComputeSlideTimingsAction $timingsAction): void
    {
        try {
            $slideTimings = $timingsAction->handle($this->video);
            $remediationVideoPath = $action->handle($this->video);

            $this->video->update([
                'slide_timings' => $slideTimings,
                'remediation_video_path' => $remediationVideoPath,
                'progress' => null,
            ]);

            Log::info("[EducationalVideo #{$this->video->id}] Remediation clip generated", ['remediation_video_path' => $remediationVideoPath]);
        } catch (Throwable $e) {
            Log::warning("[EducationalVideo #{$this->video->id}] Remediation clip generation failed, continuing without it", [
                'message' => $e->getMessage(),
            ]);

            $this->video->update(['progress' => null]);
        }
    }
}
