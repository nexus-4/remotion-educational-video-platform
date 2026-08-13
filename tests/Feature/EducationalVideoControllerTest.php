<?php

namespace Tests\Feature;

use App\Ai\Agents\WorksheetWriter;
use App\Enums\AnimationStyle;
use App\Enums\IllustrationStyle;
use App\Enums\VideoFormat;
use App\Enums\VideoStatus;
use App\Enums\VideoTemplate;
use App\Enums\VoiceType;
use App\Jobs\EducationalVideo\BuildRenderManifestJob;
use App\Jobs\EducationalVideo\GenerateStoryboardJob;
use App\Jobs\EducationalVideo\IllustrateSlidesJob;
use App\Jobs\EducationalVideo\NarrateSlidesJob;
use App\Jobs\EducationalVideo\RenderEducationalVideoJob;
use App\Models\EducationalVideo;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Bus;
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
                ->has('illustrationStyles', count(IllustrationStyle::cases()))
                ->has('animationStyles', count(AnimationStyle::cases()))
            );
    }

    public function test_store_requires_pdf_voice_template_format_and_illustration_style()
    {
        $this->post(route('educational-videos.store'), [])
            ->assertSessionHasErrors(['pdf', 'voice', 'template', 'format', 'illustration_style', 'animation_style']);
    }

    public function test_store_creates_a_video_and_dispatches_the_generation_pipeline()
    {
        Bus::fake();
        Storage::fake('local');

        $response = $this->post(route('educational-videos.store'), [
            'title' => 'The Water Cycle',
            'pdf' => UploadedFile::fake()->create('lesson.pdf', 100, 'application/pdf'),
            'voice' => VoiceType::Nova->value,
            'template' => VideoTemplate::StandardLecture->value,
            'format' => VideoFormat::Short->value,
            'illustration_style' => IllustrationStyle::FlatIllustration->value,
            'animation_style' => AnimationStyle::Underline->value,
        ]);

        $video = EducationalVideo::first();

        $response->assertRedirect(route('educational-videos.show', $video));

        $this->assertSame(VideoStatus::Pending, $video->status);
        $this->assertSame(VoiceType::Nova, $video->voice);
        Storage::disk('local')->assertExists($video->source_pdf_path);

        Bus::assertChained([
            GenerateStoryboardJob::class,
        ]);
    }

    public function test_show_displays_the_video_status()
    {
        $video = EducationalVideo::factory()->completed()->create();

        $this->get(route('educational-videos.show', $video))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('educational-videos/show')
                ->where('video.status', 'completed')
                ->where('video.interactiveCheckpoint', null)
                ->where('video.remediationVideoUrl', null)
            );
    }

    public function test_show_includes_the_interactive_checkpoint_and_remediation_url_when_present()
    {
        Storage::fake('public');

        $video = EducationalVideo::factory()->completed()->create([
            'interactive' => true,
            'interactive_checkpoint' => [
                'afterSlideIndex' => 1,
                'question' => 'What causes evaporation?',
                'options' => ['The sun heating water', 'The moon pulling water'],
                'correctOptionIndex' => 0,
                'remediationHeading' => "Let's try again",
                'remediationNarration' => 'Heat from the sun warms water until it turns into vapor.',
                'remediationImagePrompt' => null,
            ],
            'slide_timings' => [
                ['index' => 0, 'startSeconds' => 0, 'endSeconds' => 6],
                ['index' => 1, 'startSeconds' => 6, 'endSeconds' => 12],
            ],
        ]);

        Storage::disk('public')->put("educational-videos/{$video->id}-remediation.mp4", 'fake-bytes');
        $video->update(['remediation_video_path' => "educational-videos/{$video->id}-remediation.mp4"]);

        $this->get(route('educational-videos.show', $video))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('educational-videos/show')
                ->where('video.interactiveCheckpoint.afterSlideIndex', 1)
                ->where('video.interactiveCheckpoint.question', 'What causes evaporation?')
                ->where('video.interactiveCheckpoint.options', ['The sun heating water', 'The moon pulling water'])
                ->where('video.interactiveCheckpoint.correctOptionIndex', 0)
                ->missing('video.interactiveCheckpoint.remediationHeading')
                ->has('video.slideTimings', 2)
                ->where('video.remediationVideoUrl', Storage::disk('public')->url($video->remediation_video_path))
            );
    }

    /**
     * @return array<string, mixed>
     */
    private function storyboardWithSlides(): array
    {
        return [
            'title' => 'The Water Cycle',
            'summary' => 'How water moves through nature.',
            'slides' => [
                ['type' => 'intro', 'heading' => 'Welcome!', 'narration' => 'Hello.', 'bullets' => null, 'formula' => null, 'highlightTerms' => null, 'imagePrompt' => 'a droplet'],
                ['type' => 'content', 'heading' => 'Evaporation', 'narration' => 'Water becomes vapor.', 'bullets' => ['Sun heats water'], 'formula' => null, 'highlightTerms' => null, 'imagePrompt' => 'the sun'],
                ['type' => 'content', 'heading' => 'Condensation', 'narration' => 'Vapor cools into clouds.', 'bullets' => ['Vapor cools'], 'formula' => null, 'highlightTerms' => null, 'imagePrompt' => 'a cloud'],
                ['type' => 'content', 'heading' => 'Precipitation', 'narration' => 'Clouds release rain.', 'bullets' => ['Rain falls'], 'formula' => null, 'highlightTerms' => null, 'imagePrompt' => 'rain'],
                ['type' => 'outro', 'heading' => 'Great job!', 'narration' => 'That is the water cycle.', 'bullets' => null, 'formula' => null, 'highlightTerms' => null, 'imagePrompt' => null],
            ],
        ];
    }

    public function test_confirm_storyboard_saves_edits_and_continues_the_pipeline()
    {
        Bus::fake();

        $video = EducationalVideo::factory()->create([
            'status' => VideoStatus::AwaitingReview,
            'format' => VideoFormat::Short,
            'storyboard' => $this->storyboardWithSlides(),
        ]);

        $slides = $this->storyboardWithSlides()['slides'];
        $slides[1]['heading'] = 'Evaporation (edited)';
        $editedSlides = collect($slides)->map(fn (array $slide, int $index): array => ['originalIndex' => $index, ...$slide])->all();

        $response = $this->post(route('educational-videos.storyboard.confirm', $video), ['slides' => $editedSlides]);

        $response->assertRedirect(route('educational-videos.show', $video));

        $video->refresh();
        $this->assertSame('Evaporation (edited)', $video->storyboard['slides'][1]['heading']);
        $this->assertSame(VideoStatus::GeneratingAudio, $video->status);

        Bus::assertChained([
            NarrateSlidesJob::class,
            IllustrateSlidesJob::class,
            BuildRenderManifestJob::class,
            RenderEducationalVideoJob::class,
        ]);
    }

    public function test_confirm_storyboard_can_reclassify_a_slide_to_a_new_scene_type()
    {
        Bus::fake();

        $video = EducationalVideo::factory()->create([
            'status' => VideoStatus::AwaitingReview,
            'format' => VideoFormat::Short,
            'storyboard' => $this->storyboardWithSlides(),
        ]);

        $slides = collect($this->storyboardWithSlides()['slides'])->map(fn (array $slide, int $index): array => ['originalIndex' => $index, ...$slide])->all();
        $slides[1]['type'] = 'comparison';
        $slides[1]['leftLabel'] = 'Ice';
        $slides[1]['leftItems'] = ['Solid', 'Cold'];
        $slides[1]['rightLabel'] = 'Steam';
        $slides[1]['rightItems'] = ['Gas', 'Hot'];

        $this->post(route('educational-videos.storyboard.confirm', $video), ['slides' => $slides])
            ->assertRedirect(route('educational-videos.show', $video));

        $video->refresh();
        $this->assertSame('comparison', $video->storyboard['slides'][1]['type']);
        $this->assertSame('Ice', $video->storyboard['slides'][1]['leftLabel']);
        $this->assertSame(['Solid', 'Cold'], $video->storyboard['slides'][1]['leftItems']);
    }

    public function test_confirm_storyboard_requires_comparison_fields_when_reclassified_to_comparison()
    {
        $video = EducationalVideo::factory()->create([
            'status' => VideoStatus::AwaitingReview,
            'format' => VideoFormat::Short,
            'storyboard' => $this->storyboardWithSlides(),
        ]);

        $slides = collect($this->storyboardWithSlides()['slides'])->map(fn (array $slide, int $index): array => ['originalIndex' => $index, ...$slide])->all();
        $slides[1]['type'] = 'comparison';

        $this->post(route('educational-videos.storyboard.confirm', $video), ['slides' => $slides])
            ->assertSessionHasErrors(['slides.1.leftLabel', 'slides.1.leftItems', 'slides.1.rightLabel', 'slides.1.rightItems']);
    }

    public function test_confirming_the_same_storyboard_twice_only_dispatches_one_chain()
    {
        Bus::fake();

        $video = EducationalVideo::factory()->create([
            'status' => VideoStatus::AwaitingReview,
            'format' => VideoFormat::Short,
            'storyboard' => $this->storyboardWithSlides(),
        ]);

        $slides = collect($this->storyboardWithSlides()['slides'])->map(fn (array $slide, int $index): array => ['originalIndex' => $index, ...$slide])->all();

        // Simulates the user clicking "Continue" twice before the page reflects the change.
        $this->post(route('educational-videos.storyboard.confirm', $video), ['slides' => $slides]);
        $this->post(route('educational-videos.storyboard.confirm', $video), ['slides' => $slides])
            ->assertRedirect(route('educational-videos.show', $video));

        Bus::assertDispatchedTimes(NarrateSlidesJob::class, 1);
    }

    public function test_confirm_storyboard_is_a_no_op_when_video_is_not_awaiting_review()
    {
        Bus::fake();

        $video = EducationalVideo::factory()->completed()->create([
            'format' => VideoFormat::Short,
            'storyboard' => $this->storyboardWithSlides(),
        ]);

        $slides = collect($this->storyboardWithSlides()['slides'])->map(fn (array $slide, int $index): array => ['originalIndex' => $index, ...$slide])->all();

        $this->post(route('educational-videos.storyboard.confirm', $video), ['slides' => $slides])
            ->assertRedirect(route('educational-videos.show', $video));

        Bus::assertNothingDispatched();
    }

    public function test_confirm_storyboard_requires_first_slide_intro_and_last_slide_outro()
    {
        $video = EducationalVideo::factory()->create([
            'status' => VideoStatus::AwaitingReview,
            'format' => VideoFormat::Short,
            'storyboard' => $this->storyboardWithSlides(),
        ]);

        $slides = collect($this->storyboardWithSlides()['slides'])->map(fn (array $slide, int $index): array => ['originalIndex' => $index, ...$slide])->all();
        $slides[0]['type'] = 'content';
        $slides[4]['type'] = 'content';

        $this->post(route('educational-videos.storyboard.confirm', $video), ['slides' => $slides])
            ->assertSessionHasErrors(['slides.0.type', 'slides.4.type']);
    }

    public function test_retry_is_a_no_op_when_video_has_not_failed()
    {
        Bus::fake();

        $video = EducationalVideo::factory()->create(['status' => VideoStatus::Pending]);

        $this->post(route('educational-videos.retry', $video))
            ->assertRedirect(route('educational-videos.show', $video));

        Bus::assertNothingDispatched();
    }

    public function test_retry_dispatches_the_full_pipeline_when_no_storyboard_exists()
    {
        Bus::fake();

        $video = EducationalVideo::factory()->create([
            'status' => VideoStatus::Failed,
            'error' => 'Something went wrong.',
        ]);

        $response = $this->post(route('educational-videos.retry', $video));

        $response->assertRedirect(route('educational-videos.show', $video));

        $video->refresh();
        $this->assertNull($video->error);
        $this->assertSame(VideoStatus::GeneratingStoryboard, $video->status);

        Bus::assertChained([
            GenerateStoryboardJob::class,
        ]);
    }

    public function test_generate_worksheet_saves_the_generated_questions()
    {
        Storage::fake('local');

        $video = EducationalVideo::factory()->completed()->create([
            'source_pdf_path' => 'educational-videos/pdfs/lesson.pdf',
        ]);

        Storage::disk('local')->put($video->source_pdf_path, 'fake-pdf-bytes');

        WorksheetWriter::fake([[
            'questions' => [
                ['question' => 'What is 2+2?', 'options' => ['3', '4'], 'correctAnswerIndex' => 1],
            ],
        ]]);

        $response = $this->post(route('educational-videos.worksheet.generate', $video));

        $response->assertRedirect(route('educational-videos.show', $video));

        $video->refresh();
        $this->assertCount(1, $video->worksheet);
        $this->assertSame('What is 2+2?', $video->worksheet[0]['question']);
    }

    public function test_generate_worksheet_is_a_no_op_when_video_is_not_completed()
    {
        $video = EducationalVideo::factory()->create(['status' => VideoStatus::Rendering]);

        $this->post(route('educational-videos.worksheet.generate', $video))
            ->assertRedirect(route('educational-videos.show', $video));

        $this->assertNull($video->refresh()->worksheet);
    }

    public function test_show_worksheet_returns_not_found_when_worksheet_does_not_exist()
    {
        $video = EducationalVideo::factory()->completed()->create();

        $this->get(route('educational-videos.worksheet.show', $video))
            ->assertNotFound();
    }

    public function test_show_worksheet_renders_the_printable_view()
    {
        $video = EducationalVideo::factory()->completed()->create([
            'worksheet' => [
                ['question' => 'What is 2+2?', 'options' => ['3', '4'], 'correctAnswerIndex' => 1],
            ],
        ]);

        $this->get(route('educational-videos.worksheet.show', $video))
            ->assertOk()
            ->assertSee('What is 2+2?');
    }
}
