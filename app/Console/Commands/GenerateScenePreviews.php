<?php

namespace App\Console\Commands;

use App\Enums\VideoTemplate;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Process;
use Illuminate\Support\Facades\Storage;
use Laravel\Ai\Audio;

#[Signature('educational-videos:generate-scene-previews')]
#[Description('Render one reference screenshot per scene type, per template, used to preview scenes when reclassifying a slide in review')]
class GenerateScenePreviews extends Command
{
    private const PREVIEW_FRAME = 60;

    private const PLACEHOLDER_NARRATION = 'Preview.';

    /**
     * Placeholder content for each reclassifiable scene type. Keys must match the
     * reclassifiable `SlideType` values (everything except "intro"/"outro").
     *
     * @var array<string, array<string, mixed>>
     */
    private const SLIDES = [
        'content' => [
            'heading' => 'Water Cycle Basics',
            'bullets' => ['Sun heats the ocean', 'Water rises as vapor', 'Vapor cools into clouds'],
        ],
        'example' => [
            'heading' => 'A Real-World Example',
            'bullets' => ['Puddles dry up in the sun', "That's evaporation in action"],
        ],
        'formula' => [
            'heading' => 'Speed Formula',
            'formula' => 'speed = distance ÷ time',
        ],
        'comparison' => [
            'heading' => 'Mitosis vs Meiosis',
            'leftLabel' => 'Mitosis',
            'leftItems' => ['Makes 2 cells', 'Used for growth'],
            'rightLabel' => 'Meiosis',
            'rightItems' => ['Makes 4 cells', 'Used for reproduction'],
        ],
        'timeline' => [
            'heading' => 'The Water Cycle',
            'steps' => ['Evaporation', 'Condensation', 'Precipitation', 'Collection'],
        ],
        'big_stat' => [
            'heading' => 'Ocean Coverage',
            'statValue' => '71%',
            'statLabel' => "of Earth's surface is covered by ocean",
        ],
        'definition' => [
            'heading' => 'Photosynthesis',
            'term' => 'Photosynthesis',
            'definition' => 'The process plants use to turn sunlight, water, and carbon dioxide into energy and oxygen.',
        ],
    ];

    /**
     * Execute the console command.
     */
    public function handle(): void
    {
        $remotionPath = config('services.remotion.path');

        $placeholderAudio = Audio::of(self::PLACEHOLDER_NARRATION)->generate()->content();

        foreach (VideoTemplate::cases() as $template) {
            foreach (self::SLIDES as $type => $fields) {
                $previewId = "scene-preview-{$template->value}-{$type}";
                $generatedPath = "{$remotionPath}/public/generated/{$previewId}";

                File::ensureDirectoryExists("{$generatedPath}/audio");
                File::put("{$generatedPath}/audio/slide-0.mp3", $placeholderAudio);

                File::put("{$generatedPath}/manifest.json", json_encode([
                    'title' => 'Preview',
                    'summary' => 'Preview',
                    'template' => $template->value,
                    'format' => 'short',
                    'animationStyle' => 'highlight',
                    'slides' => [[
                        'type' => $type,
                        'heading' => $fields['heading'],
                        'narration' => '',
                        'bullets' => $fields['bullets'] ?? null,
                        'formula' => $fields['formula'] ?? null,
                        'highlightTerms' => null,
                        'leftLabel' => $fields['leftLabel'] ?? null,
                        'leftItems' => $fields['leftItems'] ?? null,
                        'rightLabel' => $fields['rightLabel'] ?? null,
                        'rightItems' => $fields['rightItems'] ?? null,
                        'steps' => $fields['steps'] ?? null,
                        'statValue' => $fields['statValue'] ?? null,
                        'statLabel' => $fields['statLabel'] ?? null,
                        'term' => $fields['term'] ?? null,
                        'definition' => $fields['definition'] ?? null,
                        'audioFile' => 'audio/slide-0.mp3',
                        'imageFile' => null,
                    ]],
                ], JSON_PRETTY_PRINT | JSON_THROW_ON_ERROR));

                $outputRelativePath = "out/{$previewId}.png";

                $result = Process::path($remotionPath)
                    ->timeout((int) config('services.remotion.render_timeout'))
                    ->run([
                        config('services.remotion.cli'), 'still', 'EducationalVideo',
                        $outputRelativePath,
                        '--props='.json_encode(['videoId' => $previewId]),
                        '--frame='.self::PREVIEW_FRAME,
                        '--scale=0.4',
                    ]);

                if ($result->failed()) {
                    $this->error("Failed to render preview for [{$template->value}/{$type}]: {$result->errorOutput()}");
                    File::deleteDirectory($generatedPath);

                    continue;
                }

                Storage::disk('public')->put(
                    "scene-previews/{$template->value}-{$type}.png",
                    File::get("{$remotionPath}/{$outputRelativePath}"),
                );

                File::deleteDirectory($generatedPath);
                File::delete("{$remotionPath}/{$outputRelativePath}");

                $this->info("Generated preview for [{$template->value}/{$type}] -> scene-previews/{$template->value}-{$type}.png");
            }
        }
    }
}
