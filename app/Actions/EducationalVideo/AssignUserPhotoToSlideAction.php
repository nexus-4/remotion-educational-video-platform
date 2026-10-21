<?php

namespace App\Actions\EducationalVideo;

use App\Models\EducationalVideo;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;

class AssignUserPhotoToSlideAction
{
    /**
     * Copy a teacher-uploaded photo into a slide's image slot, in place of an
     * AI-generated illustration. Stored at the exact same path shape
     * {@see IllustrateSlideAction} returns, so downstream steps (manifest building,
     * rendering) never need to know which source an image came from.
     */
    public function handle(EducationalVideo $video, string $userPhotoPath, int $index): string
    {
        $path = "educational-videos/{$video->id}/images/slide-{$index}.png";

        Storage::disk('local')->put($path, File::get(Storage::disk('public')->path($userPhotoPath)));

        return $path;
    }
}
