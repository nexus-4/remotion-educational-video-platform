<?php

namespace App\Actions\EducationalVideo;

use App\Ai\Agents\StoryboardWriter;
use App\Models\EducationalVideo;
use Illuminate\Support\Facades\Log;
use Laravel\Ai\Files\Document;

class GenerateStoryboardAction
{
    /**
     * Prompt the storyboard agent — with the source PDF attached, or with the typed topic
     * when no source document was uploaded — and return the structured storyboard.
     *
     * @return array<string, mixed>
     */
    public function handle(EducationalVideo $video): array
    {
        Log::info("[EducationalVideo #{$video->id}] Prompting storyboard agent");

        $agent = StoryboardWriter::make(
            template: $video->template,
            format: $video->format,
            contentFocus: $video->content_focus,
            interactive: $video->interactive,
            hasSourceDocument: $video->source_pdf_path !== null,
        );

        $response = $video->source_pdf_path !== null
            ? $agent->prompt(
                'Turn the attached document into an educational video storyboard. Write every field in Brazilian Portuguese (pt-BR).',
                attachments: [Document::fromStorage($video->source_pdf_path, 'local')],
            )
            : $agent->prompt("Turn this into an educational video storyboard in Brazilian Portuguese (pt-BR) about: {$video->topic}");

        $storyboard = $response->toArray();

        Log::info("[EducationalVideo #{$video->id}] Storyboard received", [
            'title' => $storyboard['title'] ?? null,
            'slide_count' => count($storyboard['slides'] ?? []),
        ]);

        Log::info('[METRICS] storyboard usage', [
            'video_id' => $video->id,
            'provider' => $response->meta->provider,
            'model' => $response->meta->model,
            'usage' => $response->usage->toArray(),
        ]);

        return $storyboard;
    }
}
