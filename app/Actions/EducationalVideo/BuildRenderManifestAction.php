<?php

namespace App\Actions\EducationalVideo;

use App\Models\EducationalVideo;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class BuildRenderManifestAction
{
    /**
     * Write the render manifest and copy narration/illustration assets into the Remotion
     * project's public folder, ready for `RenderVideoAction` to read at render time.
     *
     * @param  array<string, mixed>  $storyboard
     * @param  array<int, array<string, mixed>>  $slides
     *
     * @throws \JsonException
     */
    public function handle(EducationalVideo $video, array $storyboard, array $slides): void
    {
        $generatedPath = $this->generatedAssetsPath($video);

        File::ensureDirectoryExists($generatedPath.'/audio');
        File::ensureDirectoryExists($generatedPath.'/images');

        $manifestSlides = collect($slides)->map(function (array $slide) use ($generatedPath): array {
            $audioFilename = "slide-{$slide['index']}.mp3";

            File::copy(Storage::disk('local')->path($slide['audioPath']), $generatedPath."/audio/{$audioFilename}");

            $imageFile = null;

            if (($slide['imagePath'] ?? null) !== null) {
                $imageFilename = "slide-{$slide['index']}.png";

                File::copy(Storage::disk('local')->path($slide['imagePath']), $generatedPath."/images/{$imageFilename}");

                $imageFile = "images/{$imageFilename}";
            }

            return [
                'type' => $slide['type'],
                'heading' => $slide['heading'],
                'narration' => $slide['narration'],
                'bullets' => $slide['bullets'] ?? null,
                'formula' => $slide['formula'] ?? null,
                'highlightTerms' => $slide['highlightTerms'] ?? null,
                'leftLabel' => $slide['leftLabel'] ?? null,
                'leftItems' => $slide['leftItems'] ?? null,
                'rightLabel' => $slide['rightLabel'] ?? null,
                'rightItems' => $slide['rightItems'] ?? null,
                'steps' => $slide['steps'] ?? null,
                'statValue' => $slide['statValue'] ?? null,
                'statLabel' => $slide['statLabel'] ?? null,
                'term' => $slide['term'] ?? null,
                'definition' => $slide['definition'] ?? null,
                'audioFile' => "audio/{$audioFilename}",
                'imageFile' => $imageFile,
            ];
        })->all();

        File::put($generatedPath.'/manifest.json', json_encode([
            'title' => $storyboard['title'],
            'summary' => $storyboard['summary'],
            'template' => $video->template->value,
            'format' => $video->format->value,
            'animationStyle' => $video->animation_style->value,
            'logoFile' => $this->copyLogo($video, $generatedPath),
            'slides' => $manifestSlides,
        ], JSON_PRETTY_PRINT | JSON_THROW_ON_ERROR));

        Log::info("[EducationalVideo #{$video->id}] Render manifest written", ['path' => $generatedPath.'/manifest.json']);
    }

    /**
     * Copy the institution logo (if one was uploaded) into the generated assets folder,
     * returning its manifest-relative path, or null when there isn't one.
     */
    private function copyLogo(EducationalVideo $video, string $generatedPath): ?string
    {
        if ($video->logo_path === null) {
            return null;
        }

        File::copy(Storage::disk('local')->path($video->logo_path), $generatedPath.'/logo.png');

        return 'logo.png';
    }

    /**
     * The path, inside the Remotion project's public folder, where this video's render assets live.
     */
    private function generatedAssetsPath(EducationalVideo $video): string
    {
        return config('services.remotion.path')."/public/generated/{$video->id}";
    }
}
