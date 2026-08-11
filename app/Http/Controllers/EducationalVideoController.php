<?php

namespace App\Http\Controllers;

use App\Actions\EducationalVideo\ContinueVideoGenerationAction;
use App\Actions\EducationalVideo\GenerateWorksheetAction;
use App\Actions\EducationalVideo\QueueVideoGenerationAction;
use App\Actions\EducationalVideo\RetryVideoGenerationAction;
use App\Enums\AnimationStyle;
use App\Enums\IllustrationStyle;
use App\Enums\SlideType;
use App\Enums\VideoFormat;
use App\Enums\VideoStatus;
use App\Enums\VideoTemplate;
use App\Enums\VoiceType;
use App\Http\Requests\ConfirmStoryboardRequest;
use App\Http\Requests\StoreEducationalVideoRequest;
use App\Models\EducationalVideo;
use Illuminate\Contracts\View\View;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class EducationalVideoController extends Controller
{
    /**
     * List the generated educational videos.
     */
    public function index(): Response
    {
        return Inertia::render('educational-videos/index', [
            'videos' => EducationalVideo::query()
                ->latest()
                ->get()
                ->map(fn (EducationalVideo $video): array => [
                    'id' => $video->id,
                    'title' => $video->title ?? $video->storyboard['title'] ?? 'Untitled video',
                    'status' => $video->status->value,
                    'statusLabel' => $video->status->label(),
                    'template' => $video->template->value,
                    'thumbnailUrl' => $video->thumbnail_path ? Storage::disk('public')->url($video->thumbnail_path) : null,
                    'slideCount' => count($video->storyboard['slides'] ?? []),
                    'formatLabel' => $video->format->label(),
                    'createdAt' => $video->created_at?->toIso8601String(),
                ]),
        ]);
    }

    /**
     * Show the form for generating a new educational video.
     */
    public function create(): Response
    {
        return Inertia::render('educational-videos/create', [
            'voices' => array_map(
                fn (VoiceType $voice): array => [
                    'value' => $voice->value,
                    'label' => $voice->label(),
                    'sampleUrl' => $this->voiceSampleUrl($voice),
                ],
                VoiceType::cases(),
            ),
            'templates' => $this->options(VideoTemplate::cases()),
            'formats' => $this->options(VideoFormat::cases()),
            'illustrationStyles' => $this->options(IllustrationStyle::cases()),
            'animationStyles' => $this->options(AnimationStyle::cases()),
        ]);
    }

    /**
     * Store the uploaded PDF and queue video generation.
     */
    public function store(StoreEducationalVideoRequest $request): RedirectResponse
    {
        $data = $request->validated();

        $sourcePdfPath = $request->file('pdf')->store('educational-videos/pdfs', 'local');

        $video = EducationalVideo::create([
            'title' => $data['title'] ?? null,
            'source_pdf_path' => $sourcePdfPath,
            'voice' => $data['voice'],
            'template' => $data['template'],
            'format' => $data['format'],
            'illustration_style' => $data['illustration_style'],
            'animation_style' => $data['animation_style'],
            'content_focus' => $data['content_focus'] ?? null,
        ]);

        (new QueueVideoGenerationAction)->handle($video);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Your video is being generated.')]);

        return to_route('educational-videos.show', $video);
    }

    /**
     * Show the generation status and, once ready, the rendered video.
     */
    public function show(EducationalVideo $video): Response
    {
        return Inertia::render('educational-videos/show', [
            'video' => [
                'id' => $video->id,
                'title' => $video->title ?? $video->storyboard['title'] ?? null,
                'status' => $video->status->value,
                'statusLabel' => $video->status->label(),
                'progress' => $video->progress,
                'error' => $video->error,
                'videoUrl' => $video->video_path ? Storage::disk('public')->url($video->video_path) : null,
                'hasWorksheet' => $video->worksheet !== null,
                'scenePreviews' => $this->scenePreviews($video->template),
                'slides' => collect($video->storyboard['slides'] ?? [])
                    ->values()
                    ->map(fn (array $slide, int $index): array => [
                        'originalIndex' => $index,
                        'type' => $slide['type'],
                        'heading' => $slide['heading'],
                        'narration' => $slide['narration'],
                        'bullets' => $slide['bullets'] ?? null,
                        'formula' => $slide['formula'] ?? null,
                        'imagePrompt' => $slide['imagePrompt'] ?? null,
                        'leftLabel' => $slide['leftLabel'] ?? null,
                        'leftItems' => $slide['leftItems'] ?? null,
                        'rightLabel' => $slide['rightLabel'] ?? null,
                        'rightItems' => $slide['rightItems'] ?? null,
                        'steps' => $slide['steps'] ?? null,
                        'statValue' => $slide['statValue'] ?? null,
                        'statLabel' => $slide['statLabel'] ?? null,
                        'term' => $slide['term'] ?? null,
                        'definition' => $slide['definition'] ?? null,
                    ])
                    ->all(),
            ],
        ]);
    }

    /**
     * Save the user's edits to the AI-written storyboard and continue the pipeline.
     */
    public function confirmStoryboard(ConfirmStoryboardRequest $request, EducationalVideo $video): RedirectResponse
    {
        // Already confirmed (e.g. a duplicate submit) — just show its current progress
        // instead of erroring, since there's nothing left for this request to do.
        if ($video->status !== VideoStatus::AwaitingReview) {
            return to_route('educational-videos.show', $video);
        }

        $originalSlides = $video->storyboard['slides'];

        $slides = collect($request->validated('slides'))
            ->map(fn (array $edited): array => [
                ...$originalSlides[$edited['originalIndex']],
                'type' => $edited['type'],
                'heading' => $edited['heading'],
                'narration' => $edited['narration'],
                'bullets' => $edited['bullets'] ?? null,
                'formula' => $edited['formula'] ?? null,
                'imagePrompt' => $edited['imagePrompt'] ?? null,
                'leftLabel' => $edited['leftLabel'] ?? null,
                'leftItems' => $edited['leftItems'] ?? null,
                'rightLabel' => $edited['rightLabel'] ?? null,
                'rightItems' => $edited['rightItems'] ?? null,
                'steps' => $edited['steps'] ?? null,
                'statValue' => $edited['statValue'] ?? null,
                'statLabel' => $edited['statLabel'] ?? null,
                'term' => $edited['term'] ?? null,
                'definition' => $edited['definition'] ?? null,
            ])
            ->all();

        $video->update(['storyboard' => [...$video->storyboard, 'slides' => $slides]]);

        (new ContinueVideoGenerationAction)->handle($video);

        return to_route('educational-videos.show', $video);
    }

    /**
     * Retry a failed video, resuming from whichever stage hasn't already succeeded.
     */
    public function retry(EducationalVideo $video): RedirectResponse
    {
        // Already retried (e.g. a duplicate submit) — just show its current progress
        // instead of erroring, since there's nothing left for this request to do.
        if ($video->status !== VideoStatus::Failed) {
            return to_route('educational-videos.show', $video);
        }

        (new RetryVideoGenerationAction)->handle($video);

        return to_route('educational-videos.show', $video);
    }

    /**
     * Generate the companion comprehension worksheet for a completed video.
     */
    public function generateWorksheet(EducationalVideo $video): RedirectResponse
    {
        if ($video->status === VideoStatus::Completed) {
            $video->update(['worksheet' => (new GenerateWorksheetAction)->handle($video)]);
        }

        return to_route('educational-videos.show', $video);
    }

    /**
     * Show the printable worksheet for a video.
     */
    public function showWorksheet(EducationalVideo $video): View
    {
        abort_if($video->worksheet === null, 404);

        return view('educational-videos.worksheet', [
            'video' => $video,
            'questions' => $video->worksheet,
        ]);
    }

    /**
     * Map backed enum cases to value/label options for the frontend.
     *
     * @param  array<int, AnimationStyle|IllustrationStyle|VideoFormat|VideoTemplate|VoiceType>  $cases
     * @return array<int, array{value: string, label: string}>
     */
    private function options(array $cases): array
    {
        return array_map(
            fn (AnimationStyle|IllustrationStyle|VideoFormat|VideoTemplate|VoiceType $case): array => ['value' => $case->value, 'label' => $case->label()],
            $cases,
        );
    }

    /**
     * The public URL of the pre-generated sample clip for a voice, if it has been generated.
     */
    private function voiceSampleUrl(VoiceType $voice): ?string
    {
        $path = "voice-samples/{$voice->value}.mp3";

        return Storage::disk('public')->exists($path) ? Storage::disk('public')->url($path) : null;
    }

    /**
     * The public URLs of the pre-rendered reference screenshots for every reclassifiable
     * scene type, matching this video's template, keyed by scene type.
     *
     * @return array<string, string|null>
     */
    private function scenePreviews(VideoTemplate $template): array
    {
        return collect(SlideType::cases())
            ->reject(fn (SlideType $type): bool => in_array($type, [SlideType::Intro, SlideType::Outro], true))
            ->mapWithKeys(function (SlideType $type) use ($template): array {
                $path = "scene-previews/{$template->value}-{$type->value}.png";

                return [$type->value => Storage::disk('public')->exists($path) ? Storage::disk('public')->url($path) : null];
            })
            ->all();
    }
}
