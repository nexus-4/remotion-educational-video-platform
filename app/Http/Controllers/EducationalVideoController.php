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
            'illustrationStyles' => array_map(
                fn (IllustrationStyle $style): array => [
                    'value' => $style->value,
                    'label' => $style->label(),
                    'previewUrl' => $this->illustrationStylePreviewUrl($style),
                ],
                IllustrationStyle::cases(),
            ),
            'animationStyles' => array_map(
                fn (AnimationStyle $style): array => [
                    'value' => $style->value,
                    'label' => $style->label(),
                    'previewUrl' => $this->animationStylePreviewUrl($style),
                ],
                AnimationStyle::cases(),
            ),
        ]);
    }

    /**
     * Store the uploaded PDF and queue video generation.
     */
    public function store(StoreEducationalVideoRequest $request): RedirectResponse
    {
        $data = $request->validated();

        $sourcePdfPath = $request->hasFile('pdf')
            ? $request->file('pdf')->store('educational-videos/pdfs', 'local')
            : null;

        $userPhotos = collect($request->file('photos', []))
            ->map(fn ($photo) => $photo->store('educational-videos/user-photos', 'public'))
            ->all();

        $logoPath = $request->hasFile('logo')
            ? $request->file('logo')->store('educational-videos/logos', 'local')
            : null;

        $video = EducationalVideo::create([
            'title' => $data['title'] ?? null,
            'source_pdf_path' => $sourcePdfPath,
            'topic' => $data['topic'] ?? null,
            'user_photos' => $userPhotos === [] ? null : $userPhotos,
            'logo_path' => $logoPath,
            'voice' => $data['voice'],
            'template' => $data['template'],
            'format' => $data['format'],
            'illustration_style' => $data['illustration_style'],
            'animation_style' => $data['animation_style'],
            'content_focus' => $data['content_focus'] ?? null,
            'interactive' => $data['interactive'] ?? false,
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
                'interactiveCheckpoint' => $video->interactive_checkpoint === null ? null : [
                    'afterSlideIndex' => $video->interactive_checkpoint['afterSlideIndex'],
                    'question' => $video->interactive_checkpoint['question'],
                    'options' => $video->interactive_checkpoint['options'],
                    'correctOptionIndex' => $video->interactive_checkpoint['correctOptionIndex'],
                ],
                'slideTimings' => $video->slide_timings,
                'remediationVideoUrl' => $video->remediation_video_path ? Storage::disk('public')->url($video->remediation_video_path) : null,
                'userPhotos' => collect($video->user_photos ?? [])
                    ->map(fn (string $path): array => ['path' => $path, 'url' => Storage::disk('public')->url($path)])
                    ->all(),
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
                        'userPhotoPath' => $slide['userPhotoPath'] ?? null,
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
                // A slide added during review (negative `originalIndex`) has no AI-written
                // slide to fall back to — it only carries the fields explicitly listed below.
                ...($originalSlides[$edited['originalIndex']] ?? []),
                'type' => $edited['type'],
                'heading' => $edited['heading'],
                'narration' => $edited['narration'],
                'bullets' => $edited['bullets'] ?? null,
                'formula' => $edited['formula'] ?? null,
                'imagePrompt' => $edited['imagePrompt'] ?? null,
                'userPhotoPath' => $edited['userPhotoPath'] ?? null,
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
     * The public URL of the pre-generated reference illustration for an illustration style,
     * if it has been generated.
     */
    private function illustrationStylePreviewUrl(IllustrationStyle $style): ?string
    {
        $path = "illustration-style-previews/{$style->value}.png";

        return Storage::disk('public')->exists($path) ? Storage::disk('public')->url($path) : null;
    }

    /**
     * The public URL of the pre-rendered reference clip for an animation style, if it has
     * been generated.
     */
    private function animationStylePreviewUrl(AnimationStyle $style): ?string
    {
        $path = "animation-style-previews/{$style->value}.mp4";

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
