<?php

namespace Tests\Unit\Actions\EducationalVideo;

use App\Actions\EducationalVideo\IllustrateSlideAction;
use App\Enums\VideoTemplate;
use App\Models\EducationalVideo;
use Illuminate\Support\Facades\Storage;
use Laravel\Ai\Image;
use RuntimeException;
use Tests\TestCase;

class IllustrateSlideActionTest extends TestCase
{
    public function test_it_stores_an_illustration_for_the_given_prompt()
    {
        Storage::fake('local');
        Image::fake();

        $video = EducationalVideo::factory()->make(['id' => 1, 'template' => VideoTemplate::StandardLecture]);

        $path = (new IllustrateSlideAction)->handle($video, 'A wire carrying an electric current.', 0);

        $this->assertNotNull($path);
        Storage::disk('local')->assertExists($path);

        Image::assertGenerated(fn ($prompt) => $prompt->contains('A wire carrying an electric current.')
            && $prompt->contains('academic textbook diagram'));
    }

    public function test_it_returns_null_instead_of_throwing_when_generation_fails()
    {
        Storage::fake('local');
        Image::fake(fn () => throw new RuntimeException('image provider unavailable'));

        $video = EducationalVideo::factory()->make(['id' => 1, 'template' => VideoTemplate::NotebookLm]);

        $path = (new IllustrateSlideAction)->handle($video, 'A plant absorbing sunlight.', 0);

        $this->assertNull($path);
    }
}
