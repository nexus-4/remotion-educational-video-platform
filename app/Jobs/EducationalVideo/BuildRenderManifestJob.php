<?php

namespace App\Jobs\EducationalVideo;

use App\Actions\EducationalVideo\BuildRenderManifestAction;
use App\Enums\VideoStatus;
use App\Jobs\EducationalVideo\Concerns\IsResilientVideoJob;
use App\Models\EducationalVideo;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class BuildRenderManifestJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, IsResilientVideoJob, Queueable, SerializesModels;

    public function __construct(public EducationalVideo $video) {}

    public function handle(BuildRenderManifestAction $action): void
    {
        $this->video->update([
            'status' => VideoStatus::Rendering,
            'progress' => 'Preparing the video for rendering…',
        ]);

        $action->handle($this->video, $this->video->storyboard, $this->video->audio_manifest);
    }
}
