<?php

namespace App\Actions\EducationalVideo;

use App\Enums\VideoTemplate;
use App\Models\EducationalVideo;
use Illuminate\Support\Facades\Log;
use Laravel\Ai\Enums\Lab;
use Laravel\Ai\Image;
use Throwable;

class IllustrateSlideAction
{
    /**
     * The rendering style enforced on every illustration, regardless of what the model wrote —
     * keeps the visuals consistent and away from generic "AI art" look.
     */
    private const ILLUSTRATION_STYLE = 'Render as a clean academic textbook diagram or scientific '
        .'illustration: flat vector line art, precise and minimal, like a figure from a science textbook '
        .'or educational poster. No text, no labels, no watermarks, no photorealism, no glossy 3D render, '
        .'no cute cartoon characters, mascots, or smiling faces.';

    /**
     * Generate an illustration for a slide, storing it privately. Returns null on failure
     * so a single bad prompt never takes down the whole video.
     */
    public function handle(EducationalVideo $video, string $imagePrompt, int $index): ?string
    {
        $palette = match ($video->template) {
            VideoTemplate::NotebookLm => 'Muted, warm palette of cream, amber, and terracotta tones.',
            VideoTemplate::StandardLecture => 'Muted, cool palette of navy, slate, and soft indigo tones.',
        };

        $prompt = "{$imagePrompt} {$palette} ".self::ILLUSTRATION_STYLE;

        try {
            $image = Image::of($prompt)
                ->landscape()
                ->quality('medium')
                ->generate(provider: [Lab::OpenAI, Lab::Gemini]);

            return $image->storeAs("educational-videos/{$video->id}/images", "slide-{$index}.png", 'local');
        } catch (Throwable $e) {
            Log::warning("[EducationalVideo #{$video->id}] Illustration failed for slide {$index}, continuing without it", [
                'message' => $e->getMessage(),
            ]);

            return null;
        }
    }
}
