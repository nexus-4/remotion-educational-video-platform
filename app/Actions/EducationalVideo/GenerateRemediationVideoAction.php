<?php

namespace App\Actions\EducationalVideo;

use App\Models\EducationalVideo;
use Illuminate\Contracts\Filesystem\FileNotFoundException;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Process;
use Illuminate\Support\Facades\Storage;
use RuntimeException;

class GenerateRemediationVideoAction
{
    /**
     * Narrate, illustrate, and render the single remediation slide for a video's interactive
     * checkpoint. Deliberately does not reuse {@see BuildRenderManifestAction} or
     * {@see RenderVideoAction} — both hardcode paths keyed only on the main video's id, which
     * would overwrite the main video's own manifest/render. Everything here is scoped under a
     * `{id}-remediation` id instead, so the main video's assets are never touched.
     *
     * @throws FileNotFoundException
     */
    public function handle(EducationalVideo $video): string
    {
        $checkpoint = $video->interactive_checkpoint;
        $index = count($video->storyboard['slides']);

        $video->update(['progress' => 'Narrating the remediation clip…']);

        $narratedSlide = (new NarrateSlideAction)->handle($video, [
            'narration' => $checkpoint['remediationNarration'],
        ], $index);

        $imagePath = null;

        if (($checkpoint['remediationImagePrompt'] ?? null) !== null) {
            $video->update(['progress' => 'Illustrating the remediation clip…']);

            $imagePath = (new IllustrateSlideAction)->handle($video, $checkpoint['remediationImagePrompt'], $index);
        }

        $video->update(['progress' => 'Preparing the remediation clip for rendering…']);

        $this->writeManifest($video, $checkpoint, $narratedSlide['audioPath'], $imagePath);

        $video->update(['progress' => 'Rendering the remediation clip…']);

        return $this->render($video);
    }

    /**
     * @param  array<string, mixed>  $checkpoint
     *
     * @throws \JsonException
     */
    private function writeManifest(EducationalVideo $video, array $checkpoint, string $audioPath, ?string $imagePath): void
    {
        $generatedPath = $this->generatedAssetsPath($video);

        File::ensureDirectoryExists($generatedPath.'/audio');
        File::ensureDirectoryExists($generatedPath.'/images');

        File::copy(Storage::disk('local')->path($audioPath), $generatedPath.'/audio/slide-0.mp3');

        $imageFile = null;

        if ($imagePath !== null) {
            File::copy(Storage::disk('local')->path($imagePath), $generatedPath.'/images/slide-0.png');

            $imageFile = 'images/slide-0.png';
        }

        File::put($generatedPath.'/manifest.json', json_encode([
            'title' => $checkpoint['remediationHeading'],
            'summary' => $checkpoint['remediationHeading'],
            'template' => $video->template->value,
            'format' => $video->format->value,
            'animationStyle' => $video->animation_style->value,
            'slides' => [[
                'type' => 'content',
                'heading' => $checkpoint['remediationHeading'],
                'narration' => $checkpoint['remediationNarration'],
                'bullets' => null,
                'formula' => null,
                'highlightTerms' => null,
                'leftLabel' => null,
                'leftItems' => null,
                'rightLabel' => null,
                'rightItems' => null,
                'steps' => null,
                'statValue' => null,
                'statLabel' => null,
                'term' => null,
                'definition' => null,
                'audioFile' => 'audio/slide-0.mp3',
                'imageFile' => $imageFile,
            ]],
        ], JSON_PRETTY_PRINT | JSON_THROW_ON_ERROR));

        Log::info("[EducationalVideo #{$video->id}] Remediation manifest written", ['path' => $generatedPath.'/manifest.json']);
    }

    /**
     * @throws FileNotFoundException
     */
    private function render(EducationalVideo $video): string
    {
        $remotionVideoId = $this->remotionVideoId($video);
        $outputRelativePath = "out/{$remotionVideoId}.mp4";

        $command = [
            'npx', 'remotion', 'render', 'EducationalVideo',
            $outputRelativePath,
            '--props='.json_encode(['videoId' => $remotionVideoId]),
        ];

        Log::info("[EducationalVideo #{$video->id}] Starting remediation Remotion render", ['command' => implode(' ', $command)]);

        $result = Process::path(config('services.remotion.path'))
            ->timeout((int) config('services.remotion.render_timeout'))
            ->run($command);

        if ($result->failed()) {
            Log::error("[EducationalVideo #{$video->id}] Remediation Remotion render failed", [
                'exit_code' => $result->exitCode(),
                'output' => $result->output(),
                'error_output' => $result->errorOutput(),
            ]);

            throw new RuntimeException("Remotion render failed: {$result->errorOutput()}");
        }

        $renderedAbsolutePath = config('services.remotion.path')."/{$outputRelativePath}";
        $storedPath = "educational-videos/{$remotionVideoId}.mp4";

        Storage::disk('public')->put($storedPath, File::get($renderedAbsolutePath));

        return $storedPath;
    }

    /**
     * The id used to scope this remediation clip's generated assets and render output,
     * distinct from the main video's own id-keyed paths.
     */
    private function remotionVideoId(EducationalVideo $video): string
    {
        return "{$video->id}-remediation";
    }

    /**
     * The path, inside the Remotion project's public folder, where this remediation clip's
     * render assets live.
     */
    private function generatedAssetsPath(EducationalVideo $video): string
    {
        return config('services.remotion.path').'/public/generated/'.$this->remotionVideoId($video);
    }
}
