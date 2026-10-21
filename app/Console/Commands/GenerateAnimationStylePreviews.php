<?php

namespace App\Console\Commands;

use App\Enums\AnimationStyle;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Process;
use Illuminate\Support\Facades\Storage;
use Laravel\Ai\Audio;

#[Signature('educational-videos:generate-animation-style-previews')]
#[Description('Render one short reference clip per emphasis-animation style, used to preview styles in the create form')]
class GenerateAnimationStylePreviews extends Command
{
    private const PLACEHOLDER_NARRATION = 'Preview.';

    /**
     * Execute the console command.
     */
    public function handle(): void
    {
        $remotionPath = config('services.remotion.path');
        $placeholderAudio = Audio::of(self::PLACEHOLDER_NARRATION)->generate()->content();

        foreach (AnimationStyle::cases() as $style) {
            $previewId = "animation-style-preview-{$style->value}";
            $generatedPath = "{$remotionPath}/public/generated/{$previewId}";

            File::ensureDirectoryExists("{$generatedPath}/audio");
            File::put("{$generatedPath}/audio/slide-0.mp3", $placeholderAudio);

            File::put("{$generatedPath}/manifest.json", json_encode([
                'title' => 'Preview',
                'summary' => 'Preview',
                'template' => 'clean_minimal',
                'format' => 'short',
                'animationStyle' => $style->value,
                'slides' => [[
                    'type' => 'content',
                    'heading' => 'See It In Action',
                    'narration' => '',
                    'bullets' => ['This is how key terms get emphasized'],
                    'formula' => null,
                    'highlightTerms' => ['Emphasized', 'Key Term'],
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
                    'imageFile' => null,
                ]],
            ], JSON_PRETTY_PRINT | JSON_THROW_ON_ERROR));

            $outputRelativePath = "out/{$previewId}.mp4";

            $result = Process::path($remotionPath)
                ->timeout((int) config('services.remotion.render_timeout'))
                ->run([
                    config('services.remotion.cli'), 'render', 'EducationalVideo',
                    $outputRelativePath,
                    '--props='.json_encode(['videoId' => $previewId]),
                    '--scale=0.4',
                ]);

            if ($result->failed()) {
                $this->error("Failed to render preview for [{$style->value}]: {$result->errorOutput()}");
                File::deleteDirectory($generatedPath);

                continue;
            }

            Storage::disk('public')->put(
                "animation-style-previews/{$style->value}.mp4",
                File::get("{$remotionPath}/{$outputRelativePath}"),
            );

            File::deleteDirectory($generatedPath);
            File::delete("{$remotionPath}/{$outputRelativePath}");

            $this->info("Generated preview for [{$style->value}] -> animation-style-previews/{$style->value}.mp4");
        }
    }
}
