<?php

namespace App\Jobs\EducationalVideo;

use App\Actions\EducationalVideo\AssignUserPhotoToSlideAction;
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

    public function handle(IllustrateSlideAction $action, AssignUserPhotoToSlideAction $assignPhotoAction): void
    {
        $slides = $this->video->audio_manifest;
        $total = count($slides);

        $illustratedSlides = collect($slides)
            ->values()
            ->map(function (array $slide, int $index) use ($action, $assignPhotoAction, $total): array {
                $position = $index + 1;
                $userPhotoPath = $slide['userPhotoPath'] ?? null;

                if ($userPhotoPath !== null) {
                    $this->video->update(['progress' => "Using your photo for slide {$position} of {$total}: {$slide['heading']}"]);
                    Log::info("[EducationalVideo #{$this->video->id}] Using uploaded photo for slide {$position}/{$total}", ['photo' => $userPhotoPath]);

                    return [...$slide, 'imagePath' => $assignPhotoAction->handle($this->video, $userPhotoPath, $index)];
                }

                if (blank($slide['imagePrompt'] ?? null)) {
                    return $slide;
                }

                $this->video->update(['progress' => "Illustrating slide {$position} of {$total}: {$slide['heading']}"]);
                Log::info("[EducationalVideo #{$this->video->id}] Illustrating slide {$position}/{$total}", ['prompt' => $slide['imagePrompt']]);

                $imagePath = $action->handle($this->video, $slide['imagePrompt'], $index);

                return [...$slide, 'imagePath' => $imagePath];
            })
            ->all();

        $this->video->update(['audio_manifest' => $illustratedSlides]);
    }
}
