<?php

namespace App\Ai\Agents;

use App\Enums\VideoFormat;
use App\Enums\VideoTemplate;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Illuminate\JsonSchema\Types\Type;
use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Contracts\HasStructuredOutput;
use Laravel\Ai\Promptable;
use Stringable;

class StoryboardWriter implements Agent, HasStructuredOutput
{
    use Promptable;

    public function __construct(
        public VideoTemplate $template,
        public VideoFormat $format,
    ) {}

    /**
     * Get the instructions that the agent should follow.
     */
    public function instructions(): Stringable|string
    {
        $style = match ($this->template) {
            VideoTemplate::NotebookLm => 'a warm, conversational tone that talks the student through the source material like a friendly study companion, occasionally referencing "the document" as its source',
            VideoTemplate::StandardLecture => 'a clear, structured classroom-lecture tone, introducing each idea before explaining it',
        };

        return <<<INSTRUCTIONS
            You are an instructional designer who turns source documents into short educational videos for
            elementary and middle school students (ages 8-14).

            Write in {$style}.
            Use simple vocabulary, short sentences, and concrete examples a young student can picture.
            Base every slide strictly on the attached document — never invent facts that aren't supported by it.
            The storyboard must contain between {$this->format->minimumSlides()} and {$this->format->maximumSlides()} slides,
            following an intro -> middle -> ending arc:
            - The FIRST slide must be of type "intro": briefly welcomes the student to the topic.
            - The LAST slide must be of type "outro": warmly wraps up by recapping the single most important
              takeaway from the video in one sentence, then closes with a short, encouraging line for the student.
              Never end the video on a content, example, or formula slide.
            - Every slide in between is "content", "example", or "formula", filling the rest of the slide count.
            Use "formula" slides only for mathematical or scientific formulas that appear in the document.
            Use "example" slides to walk through a worked example or a concrete, relatable scenario.
            For each slide, list 1-4 "highlightTerms" — the exact key words or phrases from that slide's
            narration that should be visually highlighted as they are spoken.

            For every slide except "formula" and "outro" slides, write an "imagePrompt": a short, literal
            description of the objects, process, or scene to depict (e.g. "a plant's roots absorbing water
            from soil, cross-section view" or "the water cycle showing evaporation from the ocean and rain
            falling on mountains"). Describe only the SUBJECT MATTER, not an art style — the rendering style
            is applied separately. Leave "imagePrompt" null for "formula" and "outro" slides.
            INSTRUCTIONS;
    }

    /**
     * Get the agent's structured output schema definition.
     *
     * @return array<string, Type>
     */
    public function schema(JsonSchema $schema): array
    {
        return [
            'title' => $schema->string()
                ->description('A short, engaging title for the video.')
                ->required(),

            'summary' => $schema->string()
                ->description('One or two sentences summarizing what the video teaches.')
                ->required(),

            'slides' => $schema->array()
                ->min($this->format->minimumSlides())
                ->max($this->format->maximumSlides())
                ->items(
                    $schema->object([
                        'type' => $schema->string()
                            ->enum(['intro', 'content', 'formula', 'example', 'outro'])
                            ->description('The kind of slide this is.')
                            ->required(),
                        'heading' => $schema->string()
                            ->description('A short heading shown on the slide.')
                            ->required(),
                        'narration' => $schema->string()
                            ->description('The exact words the narrator speaks for this slide.')
                            ->required(),
                        'bullets' => $schema->array()
                            ->items($schema->string())
                            ->description('Optional short supporting bullet points shown on the slide.')
                            ->nullable(),
                        'formula' => $schema->string()
                            ->description('The formula to display, only set when type is "formula".')
                            ->nullable(),
                        'highlightTerms' => $schema->array()
                            ->items($schema->string())
                            ->description('Key words from the narration to visually highlight as they are spoken.')
                            ->nullable(),
                        'imagePrompt' => $schema->string()
                            ->description('A short, literal description of the subject matter to illustrate for this slide (no art-style words). Null for "formula" and "outro" slides.')
                            ->nullable(),
                    ])->withoutAdditionalProperties()
                )
                ->description('The ordered slides that make up the video.')
                ->required(),
        ];
    }
}
