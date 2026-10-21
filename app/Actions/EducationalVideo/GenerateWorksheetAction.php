<?php

namespace App\Actions\EducationalVideo;

use App\Ai\Agents\WorksheetWriter;
use App\Models\EducationalVideo;
use Illuminate\Support\Facades\Log;
use Laravel\Ai\Files\Document;
use Laravel\Ai\Responses\StructuredAgentResponse;
use UnexpectedValueException;

class GenerateWorksheetAction
{
    /**
     * Prompt the worksheet agent with the source PDF attached and return the structured
     * list of comprehension questions.
     *
     * @return array<int, array<string, mixed>>
     */
    public function handle(EducationalVideo $video): array
    {
        Log::info("[EducationalVideo #{$video->id}] Prompting worksheet agent");

        $agent = WorksheetWriter::make();

        $response = $agent->prompt(
            'Write a comprehension worksheet for the attached document.',
            attachments: [Document::fromStorage($video->source_pdf_path, 'local')],
        );

        if (! $response instanceof StructuredAgentResponse) {
            throw new UnexpectedValueException('The worksheet agent did not return structured data.');
        }

        $questions = $response->toArray()['questions'];

        Log::info("[EducationalVideo #{$video->id}] Worksheet received", [
            'question_count' => count($questions),
        ]);

        return $questions;
    }
}
