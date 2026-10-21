<?php

namespace App\Jobs\EducationalVideo;

use App\Actions\EducationalVideo\NarrateSlideAction;
use App\Enums\VideoStatus;
use App\Jobs\EducationalVideo\Concerns\IsResilientVideoJob;
use App\Models\EducationalVideo;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class NarrateSlidesJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, IsResilientVideoJob, Queueable, SerializesModels;

    public function __construct(public EducationalVideo $video) {}

    public function handle(NarrateSlideAction $action): void
    {
        $this->video->update(['status' => VideoStatus::GeneratingAudio]);

        /** @var array<int, array<string, mixed>> $slides */
        $slides = $this->video->storyboard['slides'];
        $total = count($slides);

        $narratedSlides = collect($slides)
            ->values()
            ->map(function (array $slide, int $index) use ($action, $total): array {
                $position = $index + 1;

                $this->video->update(['progress' => "Narrating slide {$position} of {$total}: {$slide['heading']}"]);
                Log::info("[EducationalVideo #{$this->video->id}] Narrating slide {$position}/{$total}", ['heading' => $slide['heading']]);

                return $action->handle($this->video, $slide, $index);
            })
            ->all();

        $this->video->update(['audio_manifest' => $narratedSlides]);
    }
}
