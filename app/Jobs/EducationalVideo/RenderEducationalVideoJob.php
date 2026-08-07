<?php

namespace App\Jobs\EducationalVideo;

use App\Actions\EducationalVideo\RenderVideoAction;
use App\Enums\VideoStatus;
use App\Jobs\EducationalVideo\Concerns\IsResilientVideoJob;
use App\Models\EducationalVideo;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\Attributes\FailOnTimeout;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

#[FailOnTimeout]
class RenderEducationalVideoJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, IsResilientVideoJob, Queueable, SerializesModels;

    public function __construct(public EducationalVideo $video) {}

    public function handle(RenderVideoAction $action): void
    {
        $this->video->update(['progress' => 'Rendering the video — this can take a minute…']);

        $videoPath = $action->handle($this->video);

        $this->video->update([
            'video_path' => $videoPath,
            'status' => VideoStatus::Completed,
            'progress' => null,
        ]);

        Log::info("[EducationalVideo #{$this->video->id}] Generation completed", ['video_path' => $videoPath]);
    }
}
