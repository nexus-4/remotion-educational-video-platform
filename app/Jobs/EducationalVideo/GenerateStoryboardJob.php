<?php

namespace App\Jobs\EducationalVideo;

use App\Actions\EducationalVideo\GenerateStoryboardAction;
use App\Enums\VideoStatus;
use App\Jobs\EducationalVideo\Concerns\IsResilientVideoJob;
use App\Models\EducationalVideo;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class GenerateStoryboardJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, IsResilientVideoJob, Queueable, SerializesModels;

    public function __construct(public EducationalVideo $video) {}

    public function handle(GenerateStoryboardAction $action): void
    {
        Log::info("[EducationalVideo #{$this->video->id}] Starting generation", [
            'template' => $this->video->template->value,
            'format' => $this->video->format->value,
            'voice' => $this->video->voice->value,
        ]);

        $this->video->update([
            'status' => VideoStatus::GeneratingStoryboard,
            'progress' => 'Reading the document and writing the storyboard…',
        ]);

        $storyboard = $action->handle($this->video);

        $this->video->update([
            'storyboard' => $storyboard,
            'status' => VideoStatus::AwaitingReview,
            'progress' => null,
        ]);
    }
}
