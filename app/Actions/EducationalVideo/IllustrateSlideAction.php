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
     * Generate an illustration for a slide, storing it privately. Returns null on failure
     * so a single bad prompt never takes down the whole video.
     */
    public function handle(EducationalVideo $video, string $imagePrompt, int $index): ?string
    {
        $palette = match ($video->template) {
            VideoTemplate::NotebookLm => 'Muted, warm palette of cream, amber, and terracotta tones.',
            VideoTemplate::StandardLecture => 'Muted, cool palette of navy, slate, and soft indigo tones.',
            VideoTemplate::CleanMinimal => 'Soft, airy palette of white, pastel violet, and pastel pink tones.',
        };

        $prompt = "{$imagePrompt} {$palette} ".$video->illustration_style->stylePrompt();

        try {
            $image = Image::of($prompt)
                ->landscape()
                ->quality('low')
                ->generate(provider: [Lab::OpenAI, Lab::Gemini]);

            Log::info('[METRICS] image usage', [
                'video_id' => $video->id,
                'slide_index' => $index,
                'provider' => $image->meta->provider,
                'model' => $image->meta->model,
                'usage' => $image->usage->toArray(),
            ]);

            $storedPath = $image->storeAs("educational-videos/{$video->id}/images", "slide-{$index}.png", 'local');

            return is_string($storedPath) ? $storedPath : null;
        } catch (Throwable $e) {
            Log::warning("[EducationalVideo #{$video->id}] Illustration failed for slide {$index}, continuing without it", [
                'message' => $e->getMessage(),
            ]);

            return null;
        }
    }
}
