<?php

namespace App\Http\Controllers;

use App\Actions\EducationalVideo\QueueVideoGenerationAction;
use App\Enums\AnimationStyle;
use App\Enums\IllustrationStyle;
use App\Enums\VideoFormat;
use App\Enums\VideoTemplate;
use App\Enums\VoiceType;
use App\Http\Requests\StoreEducationalVideoRequest;
use App\Models\EducationalVideo;
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
                'slides' => collect($video->storyboard['slides'] ?? [])
                    ->map(fn (array $slide): array => ['type' => $slide['type'], 'heading' => $slide['heading']])
                    ->all(),
            ],
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
}
