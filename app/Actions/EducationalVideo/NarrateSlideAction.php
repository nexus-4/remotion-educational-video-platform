<?php

namespace App\Actions\EducationalVideo;

use App\Models\EducationalVideo;
use Laravel\Ai\Audio;

class NarrateSlideAction
{
    /**
     * Generate narration audio for a single slide and store it privately.
     *
     * @param  array<string, mixed>  $slide
     * @return array<string, mixed>
     */
    public function handle(EducationalVideo $video, array $slide, int $index): array
    {
        $audio = Audio::of($slide['narration'])
            ->voice($video->voice->value)
            ->generate();

        $audioPath = $audio->storeAs("educational-videos/{$video->id}/audio", "slide-{$index}.mp3", 'local');

        return [...$slide, 'index' => $index, 'audioPath' => $audioPath];
    }
}
