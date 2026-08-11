<?php

namespace Tests\Feature\Console;

use App\Enums\SlideType;
use App\Enums\VideoTemplate;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Process;
use Illuminate\Support\Facades\Storage;
use Laravel\Ai\Audio;
use Tests\TestCase;

class GenerateScenePreviewsTest extends TestCase
{
    protected string $remotionPath;

    protected function setUp(): void
    {
        parent::setUp();

        $this->remotionPath = sys_get_temp_dir().'/remotion-scene-previews-test-'.uniqid();

        File::ensureDirectoryExists($this->remotionPath.'/out');

        config(['services.remotion.path' => $this->remotionPath]);
    }

    protected function tearDown(): void
    {
        File::deleteDirectory($this->remotionPath);

        parent::tearDown();
    }

    public function test_it_generates_a_preview_for_every_reclassifiable_type_and_template()
    {
        Storage::fake('public');
        Audio::fake();

        Process::fake(function ($process) {
            $outputRelativePath = $process->command[4] ?? null;

            if ($outputRelativePath) {
                File::put("{$this->remotionPath}/{$outputRelativePath}", 'fake-png-bytes');
            }

            return 0;
        });

        $this->artisan('educational-videos:generate-scene-previews')->assertSuccessful();

        $reclassifiableTypes = collect(SlideType::cases())
            ->reject(fn (SlideType $type): bool => in_array($type, [SlideType::Intro, SlideType::Outro], true));

        foreach (VideoTemplate::cases() as $template) {
            foreach ($reclassifiableTypes as $type) {
                Storage::disk('public')->assertExists("scene-previews/{$template->value}-{$type->value}.png");
            }
        }
    }
}
