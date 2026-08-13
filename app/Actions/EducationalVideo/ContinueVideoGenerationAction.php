<?php

namespace App\Actions\EducationalVideo;

use App\Actions\EducationalVideo\Concerns\CatchesChainFailures;
use App\Enums\VideoStatus;
use App\Jobs\EducationalVideo\BuildRenderManifestJob;
use App\Jobs\EducationalVideo\GenerateRemediationVideoJob;
use App\Jobs\EducationalVideo\IllustrateSlidesJob;
use App\Jobs\EducationalVideo\NarrateSlidesJob;
use App\Jobs\EducationalVideo\RenderEducationalVideoJob;
use App\Models\EducationalVideo;
use Illuminate\Support\Facades\Bus;

class ContinueVideoGenerationAction
{
    use CatchesChainFailures;

    /**
     * Dispatch the narration/illustration/rendering stages once the user has confirmed
     * (and optionally edited) the storyboard written by {@see QueueVideoGenerationAction}.
     *
     * The status is flipped to `GeneratingAudio` here, synchronously, rather than waiting
     * for `NarrateSlidesJob` to pick it up — otherwise, until a queue worker actually runs
     * that job, the video still looks `awaiting_review` and a repeated confirm request
     * would slip past that guard and dispatch a second, duplicate chain.
     *
     * When the storyboard has an interactive checkpoint, one more stage is appended after the
     * main video finishes rendering: it generates the short remediation clip a student sees on
     * a wrong answer. That stage never fails the chain (see {@see GenerateRemediationVideoJob})
     * — by the time it runs the main video is already complete and watchable either way.
     */
    public function handle(EducationalVideo $video): void
    {
        $video->update(['status' => VideoStatus::GeneratingAudio, 'progress' => null]);

        Bus::chain([
            new NarrateSlidesJob($video),
            new IllustrateSlidesJob($video),
            new BuildRenderManifestJob($video),
            new RenderEducationalVideoJob($video),
            ...($video->interactive_checkpoint !== null ? [new GenerateRemediationVideoJob($video)] : []),
        ])->catch($this->catchChainFailure($video))->dispatch();
    }
}
