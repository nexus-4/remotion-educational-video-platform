<?php

namespace App\Jobs\EducationalVideo;

use App\Actions\EducationalVideo\IllustrateSlideAction;
use App\Jobs\EducationalVideo\Concerns\IsResilientVideoJob;
use App\Models\EducationalVideo;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class IllustrateSlidesJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, IsResilientVideoJob, Queueable, SerializesModels;

    public function __construct(public EducationalVideo $video) {}

    public function handle(IllustrateSlideAction $action): void
    {
        $slides = $this->video->audio_manifest;
        $total = count($slides);

        $illustratedSlides = collect($slides)
            ->values()
            ->map(function (array $slide, int $index) use ($action, $total): array {
                if (blank($slide['imagePrompt'] ?? null)) {
                    return $slide;
                }

                $position = $index + 1;

                $this->video->update(['progress' => "Illustrating slide {$position} of {$total}: {$slide['heading']}"]);
                Log::info("[EducationalVideo #{$this->video->id}] Illustrating slide {$position}/{$total}", ['prompt' => $slide['imagePrompt']]);

                $imagePath = $action->handle($this->video, $slide['imagePrompt'], $index);

                return [...$slide, 'imagePath' => $imagePath];
            })
            ->all();

        $this->video->update(['audio_manifest' => $illustratedSlides]);
    }
}
