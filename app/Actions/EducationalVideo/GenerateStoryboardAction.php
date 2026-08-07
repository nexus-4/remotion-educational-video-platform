<?php

namespace App\Actions\EducationalVideo;

use App\Ai\Agents\StoryboardWriter;
use App\Models\EducationalVideo;
use Illuminate\Support\Facades\Log;
use Laravel\Ai\Files\Document;

class GenerateStoryboardAction
{
    /**
     * Prompt the storyboard agent with the source PDF attached and return the structured storyboard.
     *
     * @return array<string, mixed>
     */
    public function handle(EducationalVideo $video): array
    {
        Log::info("[EducationalVideo #{$video->id}] Prompting storyboard agent");

        $agent = StoryboardWriter::make(template: $video->template, format: $video->format);

        $response = $agent->prompt(
            'Turn the attached document into an educational video storyboard.',
            attachments: [Document::fromStorage($video->source_pdf_path, 'local')],
        );

        $storyboard = $response->toArray();

        Log::info("[EducationalVideo #{$video->id}] Storyboard received", [
            'title' => $storyboard['title'] ?? null,
            'slide_count' => count($storyboard['slides'] ?? []),
        ]);

        return $storyboard;
    }
}
