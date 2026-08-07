<?php

namespace Tests\Feature;

use App\Enums\VideoFormat;
use App\Enums\VideoStatus;
use App\Enums\VideoTemplate;
use App\Enums\VoiceType;
use App\Jobs\ProcessEducationalVideo;
use App\Models\EducationalVideo;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class EducationalVideoControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_index_lists_generated_videos()
    {
        $video = EducationalVideo::factory()->completed()->create(['title' => 'The Water Cycle']);

        $this->get(route('educational-videos.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('educational-videos/index')
                ->has('videos', 1)
                ->where('videos.0.id', $video->id)
                ->where('videos.0.title', 'The Water Cycle')
                ->where('videos.0.status', 'completed')
            );
    }

    public function test_create_page_is_displayed_with_enum_options()
    {
        $this->get(route('educational-videos.create'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('educational-videos/create')
                ->has('voices', count(VoiceType::cases()))
                ->has('templates', count(VideoTemplate::cases()))
                ->has('formats', count(VideoFormat::cases()))
            );
    }

    public function test_store_requires_pdf_voice_template_and_format()
    {
        $this->post(route('educational-videos.store'), [])
            ->assertSessionHasErrors(['pdf', 'voice', 'template', 'format']);
    }

    public function test_store_creates_a_video_and_dispatches_the_generation_job()
    {
        Queue::fake();
        Storage::fake('local');

        $response = $this->post(route('educational-videos.store'), [
            'title' => 'The Water Cycle',
            'pdf' => UploadedFile::fake()->create('lesson.pdf', 100, 'application/pdf'),
            'voice' => VoiceType::Nova->value,
            'template' => VideoTemplate::StandardLecture->value,
            'format' => VideoFormat::Short->value,
        ]);

        $video = EducationalVideo::first();

        $response->assertRedirect(route('educational-videos.show', $video));

        $this->assertSame(VideoStatus::Pending, $video->status);
        $this->assertSame(VoiceType::Nova, $video->voice);
        Storage::disk('local')->assertExists($video->source_pdf_path);

        Queue::assertPushed(ProcessEducationalVideo::class, fn ($job) => $job->video->is($video));
    }

    public function test_show_displays_the_video_status()
    {
        $video = EducationalVideo::factory()->completed()->create();

        $this->get(route('educational-videos.show', $video))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('educational-videos/show')
                ->where('video.status', 'completed')
            );
    }
}
