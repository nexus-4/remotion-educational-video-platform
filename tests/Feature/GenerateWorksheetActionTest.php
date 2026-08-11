<?php

namespace Tests\Feature;

use App\Actions\EducationalVideo\GenerateWorksheetAction;
use App\Ai\Agents\WorksheetWriter;
use App\Models\EducationalVideo;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class GenerateWorksheetActionTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_returns_the_generated_questions()
    {
        Storage::fake('local');

        $video = EducationalVideo::factory()->create([
            'source_pdf_path' => 'educational-videos/pdfs/lesson.pdf',
        ]);

        Storage::disk('local')->put($video->source_pdf_path, 'fake-pdf-bytes');

        WorksheetWriter::fake([[
            'questions' => [
                ['question' => 'What is 2+2?', 'options' => ['3', '4'], 'correctAnswerIndex' => 1],
                ['question' => 'What color is the sky?', 'options' => ['Blue', 'Green'], 'correctAnswerIndex' => 0],
            ],
        ]]);

        $questions = (new GenerateWorksheetAction)->handle($video);

        $this->assertCount(2, $questions);
        $this->assertSame('What is 2+2?', $questions[0]['question']);
        $this->assertSame(1, $questions[0]['correctAnswerIndex']);
    }
}
