<?php

namespace App\Actions\EducationalVideo;

use App\Actions\EducationalVideo\Concerns\CatchesChainFailures;
use App\Jobs\EducationalVideo\GenerateStoryboardJob;
use App\Models\EducationalVideo;
use Illuminate\Support\Facades\Bus;

class QueueVideoGenerationAction
{
    use CatchesChainFailures;

    /**
     * Dispatch the storyboard-writing stage. The pipeline pauses once the storyboard is
     * written so the user can review it before narration/illustration/rendering continue
     * — see {@see ContinueVideoGenerationAction}.
     */
    public function handle(EducationalVideo $video): void
    {
        Bus::chain([
            new GenerateStoryboardJob($video),
        ])->catch($this->catchChainFailure($video))->dispatch();
    }
}
