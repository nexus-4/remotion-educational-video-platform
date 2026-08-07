<?php

namespace App\Actions;

use App\Ai\Agents\StoryboardWriter;
use App\Enums\VideoStatus;
use App\Enums\VideoTemplate;
use App\Models\EducationalVideo;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Process;
use Illuminate\Support\Facades\Storage;
use Laravel\Ai\Audio;
use Laravel\Ai\Enums\Lab;
use Laravel\Ai\Files\Document;
use Laravel\Ai\Image;
use RuntimeException;
use Throwable;

class GenerateEducationalVideo
{
    /**
     * Orchestrate the full storyboard -> narration -> render pipeline for a video.
     */
    public function handle(EducationalVideo $video): void
    {
        Log::info("[EducationalVideo #{$video->id}] Starting generation", [
            'template' => $video->template->value,
            'format' => $video->format->value,
            'voice' => $video->voice->value,
        ]);

        try {
            $storyboard = $this->writeStoryboard($video);

            $video->update(['storyboard' => $storyboard, 'status' => VideoStatus::GeneratingAudio]);

            $slides = $this->produceSlideAssets($video, $storyboard['slides']);

            $video->update(['audio_manifest' => $slides, 'status' => VideoStatus::Rendering, 'progress' => 'Preparing the video for rendering…']);

            $this->writeRenderManifest($video, $storyboard, $slides);

            $videoPath = $this->render($video);

            $video->update(['video_path' => $videoPath, 'status' => VideoStatus::Completed, 'progress' => null]);

            Log::info("[EducationalVideo #{$video->id}] Generation completed", ['video_path' => $videoPath]);
        } catch (Throwable $e) {
            Log::error("[EducationalVideo #{$video->id}] Generation failed", [
                'message' => $e->getMessage(),
                'exception' => $e::class,
            ]);

            $video->update(['status' => VideoStatus::Failed, 'error' => $e->getMessage(), 'progress' => null]);

            throw $e;
        }
    }

    /**
     * Prompt the storyboard agent with the source PDF attached and return the structured storyboard.
     *
     * @return array<string, mixed>
     */
    private function writeStoryboard(EducationalVideo $video): array
    {
        $video->update(['status' => VideoStatus::GeneratingStoryboard, 'progress' => 'Reading the document and writing the storyboard…']);

        Log::info("[EducationalVideo #{$video->id}] Prompting storyboard agent");

        $agent = StoryboardWriter::make(template: $video->template, format: $video->format);

        $response = $agent->prompt(
            'Turn the attached document into an educational video storyboard.',
            attachments: [Document::fromStorage($video->source_pdf_path, 'local')],
        );

        $storyboard = $response->toArray();

        Log::info("[EducationalVideo #{$video->id}] Storyboard received", [
            'title' => $storyboard['title'] ?? null,
            'slide_count' => count($storyboard['slides'] ?? []),
        ]);

        return $storyboard;
    }

    /**
     * Generate narration audio and an illustration for each slide.
     *
     * @param  array<int, array<string, mixed>>  $slides
     * @return array<int, array<string, mixed>>
     */
    private function produceSlideAssets(EducationalVideo $video, array $slides): array
    {
        $total = count($slides);

        return collect($slides)
            ->values()
            ->map(function (array $slide, int $index) use ($video, $total): array {
                $position = $index + 1;

                $video->update(['progress' => "Narrating slide {$position} of {$total}: {$slide['heading']}"]);
                Log::info("[EducationalVideo #{$video->id}] Narrating slide {$position}/{$total}", ['heading' => $slide['heading']]);

                $audio = Audio::of($slide['narration'])
                    ->voice($video->voice->value)
                    ->generate();

                $audioPath = $audio->storeAs("educational-videos/{$video->id}/audio", "slide-{$index}.mp3", 'local');

                $imagePath = null;

                if (filled($slide['imagePrompt'] ?? null)) {
                    $video->update(['progress' => "Illustrating slide {$position} of {$total}: {$slide['heading']}"]);
                    Log::info("[EducationalVideo #{$video->id}] Illustrating slide {$position}/{$total}", ['prompt' => $slide['imagePrompt']]);

                    $imagePath = $this->illustrateSlide($video, $slide, $index);
                }

                return [...$slide, 'index' => $index, 'audioPath' => $audioPath, 'imagePath' => $imagePath];
            })
            ->all();
    }

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
     *
     * @param  array<string, mixed>  $slide
     */
    private function illustrateSlide(EducationalVideo $video, array $slide, int $index): ?string
    {
        $palette = match ($video->template) {
            VideoTemplate::NotebookLm => 'Muted, warm palette of cream, amber, and terracotta tones.',
            VideoTemplate::StandardLecture => 'Muted, cool palette of navy, slate, and soft indigo tones.',
        };

        $prompt = "{$slide['imagePrompt']} {$palette} ".self::ILLUSTRATION_STYLE;

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

    /**
     * Write the render manifest and narration/illustration assets that the Remotion project reads at render time.
     *
     * @param  array<string, mixed>  $storyboard
     * @param  array<int, array<string, mixed>>  $slides
     */
    private function writeRenderManifest(EducationalVideo $video, array $storyboard, array $slides): void
    {
        $generatedPath = $this->generatedAssetsPath($video);

        File::ensureDirectoryExists($generatedPath.'/audio');
        File::ensureDirectoryExists($generatedPath.'/images');

        $manifestSlides = collect($slides)->map(function (array $slide) use ($generatedPath): array {
            $audioFilename = "slide-{$slide['index']}.mp3";

            File::copy(Storage::disk('local')->path($slide['audioPath']), $generatedPath."/audio/{$audioFilename}");

            $imageFile = null;

            if ($slide['imagePath'] !== null) {
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
                'audioFile' => "audio/{$audioFilename}",
                'imageFile' => $imageFile,
            ];
        })->all();

        File::put($generatedPath.'/manifest.json', json_encode([
            'title' => $storyboard['title'],
            'summary' => $storyboard['summary'],
            'template' => $video->template->value,
            'format' => $video->format->value,
            'slides' => $manifestSlides,
        ], JSON_PRETTY_PRINT | JSON_THROW_ON_ERROR));

        Log::info("[EducationalVideo #{$video->id}] Render manifest written", ['path' => $generatedPath.'/manifest.json']);
    }

    /**
     * Invoke the Remotion CLI to render the composition and store the resulting MP4.
     */
    private function render(EducationalVideo $video): string
    {
        $video->update(['progress' => 'Rendering the video — this can take a minute…']);

        $outputRelativePath = "out/{$video->id}.mp4";

        $command = [
            'npx', 'remotion', 'render', 'EducationalVideo',
            $outputRelativePath,
            '--props='.json_encode(['videoId' => (string) $video->id]),
        ];

        Log::info("[EducationalVideo #{$video->id}] Starting Remotion render", ['command' => implode(' ', $command)]);

        $startedAt = microtime(true);

        $result = Process::path(config('services.remotion.path'))
            ->timeout((int) config('services.remotion.render_timeout'))
            ->run($command);

        $durationInSeconds = round(microtime(true) - $startedAt, 1);

        if ($result->failed()) {
            Log::error("[EducationalVideo #{$video->id}] Remotion render failed", [
                'exit_code' => $result->exitCode(),
                'output' => $result->output(),
                'error_output' => $result->errorOutput(),
            ]);

            throw new RuntimeException("Remotion render failed: {$result->errorOutput()}");
        }

        Log::info("[EducationalVideo #{$video->id}] Remotion render finished", ['duration_seconds' => $durationInSeconds]);

        $video->update(['progress' => 'Saving the rendered video…']);

        $renderedAbsolutePath = config('services.remotion.path')."/{$outputRelativePath}";
        $storedPath = "educational-videos/{$video->id}.mp4";

        Storage::disk('public')->put($storedPath, File::get($renderedAbsolutePath));

        return $storedPath;
    }

    /**
     * The path, inside the Remotion project's public folder, where this video's render assets live.
     */
    private function generatedAssetsPath(EducationalVideo $video): string
    {
        return config('services.remotion.path')."/public/generated/{$video->id}";
    }
}
