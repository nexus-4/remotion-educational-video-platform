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
        public ?string $contentFocus = null,
        public bool $interactive = false,
    ) {}

    /**
     * Get the instructions that the agent should follow.
     */
    public function instructions(): Stringable|string
    {
        $style = match ($this->template) {
            VideoTemplate::NotebookLm => 'a warm, conversational tone that talks the student through the source material like a friendly study companion, occasionally referencing "the document" as its source',
            VideoTemplate::StandardLecture => 'a clear, structured classroom-lecture tone, introducing each idea before explaining it',
            VideoTemplate::CleanMinimal => 'a calm, plain-spoken tone that gets straight to the point with short, clear statements',
        };

        $focus = $this->contentFocus === null
            ? ''
            : "\n\nThe student/teacher specifically wants this video to focus on: {$this->contentFocus}. Make sure the storyboard reflects that emphasis.";

        $checkpoint = ! $this->interactive
            ? ''
            : "\n\nThis video is INTERACTIVE: also fill in the top-level \"checkpoint\" object, a single "
                .'comprehension check placed after a real concept has already been taught partway through the '
                .'video (never after the intro, and never as/after the outro). Set "afterSlideIndex" to the '
                .'0-based index of the slide the checkpoint follows. Write a short "question" a student could '
                ."answer just from what's been said so far, with exactly 2 short \"options\" and a "
                .'"correctOptionIndex" (0 or 1). Write a "remediationHeading" and "remediationNarration" '
                .'that re-teach the same concept a genuinely different way (a different example or a simpler '
                ."explanation, not a repeat of the original slide's wording) for a student who answers wrong. "
                .'Optionally set "remediationImagePrompt" the same way as a normal slide\'s "imagePrompt" '
                .'(subject matter only, no art-style words), or leave it null if no illustration is needed.';

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
            - Every slide in between is "content", "example", "formula", "comparison", "timeline", "big_stat",
              or "definition", filling the rest of the slide count.
            Use "formula" slides only for mathematical or scientific formulas that appear in the document.
            Use "example" slides to walk through a worked example or a concrete, relatable scenario.
            The "comparison", "timeline", "big_stat", and "definition" types are optional extras — use them
            ONLY where they genuinely fit the source material, never as filler:
            - "comparison": the document contrasts two things. Set "leftLabel"/"rightLabel" (short names for
              each side) and "leftItems"/"rightItems" (1-4 short points each).
            - "timeline": the document describes an ordered sequence or process. Set "steps" to 2-6 short,
              ordered strings.
            - "big_stat": the document contains one striking number or statistic worth making the whole
              focus of a slide. Set "statValue" (the number, with unit/symbol if relevant) and "statLabel"
              (a short caption explaining what it is).
            - "definition": the document introduces an important vocabulary term. Set "term" and a one or
              two sentence "definition" in plain language.
            For each slide, list 1-4 "highlightTerms" — the exact key words or phrases from that slide's
            narration that should be visually highlighted as they are spoken.

            For every slide except "formula", "comparison", "timeline", "big_stat", "definition", and "outro"
            slides, write an "imagePrompt": a short, literal description of the objects, process, or scene to
            depict (e.g. "a plant's roots absorbing water from soil, cross-section view" or "the water cycle
            showing evaporation from the ocean and rain falling on mountains"). Describe only the SUBJECT
            MATTER, not an art style — the rendering style is applied separately. Leave "imagePrompt" null for
            all of those types — they never display an illustration.
            {$focus}{$checkpoint}
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
            ...($this->interactive ? ['checkpoint' => $this->checkpointSchema($schema)] : []),

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
                            ->enum(['intro', 'content', 'formula', 'example', 'comparison', 'timeline', 'big_stat', 'definition', 'outro'])
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
                            ->description('A short, literal description of the subject matter to illustrate for this slide (no art-style words). Null for "formula", "comparison", "timeline", "big_stat", "definition", and "outro" slides.')
                            ->nullable(),
                        'leftLabel' => $schema->string()
                            ->description('Short name for the left side, only set when type is "comparison".')
                            ->nullable(),
                        'leftItems' => $schema->array()
                            ->items($schema->string())
                            ->description('1-4 short points for the left side, only set when type is "comparison".')
                            ->nullable(),
                        'rightLabel' => $schema->string()
                            ->description('Short name for the right side, only set when type is "comparison".')
                            ->nullable(),
                        'rightItems' => $schema->array()
                            ->items($schema->string())
                            ->description('1-4 short points for the right side, only set when type is "comparison".')
                            ->nullable(),
                        'steps' => $schema->array()
                            ->items($schema->string())
                            ->description('2-6 short, ordered steps, only set when type is "timeline".')
                            ->nullable(),
                        'statValue' => $schema->string()
                            ->description('The standout number/statistic, with unit or symbol if relevant, only set when type is "big_stat".')
                            ->nullable(),
                        'statLabel' => $schema->string()
                            ->description('A short caption explaining the statistic, only set when type is "big_stat".')
                            ->nullable(),
                        'term' => $schema->string()
                            ->description('The vocabulary term being introduced, only set when type is "definition".')
                            ->nullable(),
                        'definition' => $schema->string()
                            ->description('A one or two sentence, plain-language definition of "term", only set when type is "definition".')
                            ->nullable(),
                    ])->withoutAdditionalProperties()
                )
                ->description('The ordered slides that make up the video.')
                ->required(),
        ];
    }

    /**
     * Build the schema for the single interactive comprehension checkpoint.
     */
    private function checkpointSchema(JsonSchema $schema): Type
    {
        return $schema->object([
            'afterSlideIndex' => $schema->integer()
                ->description('The 0-based index of the slide this checkpoint follows.')
                ->required(),
            'question' => $schema->string()
                ->description('A short comprehension question answerable from what has been taught so far.')
                ->required(),
            'options' => $schema->array()
                ->items($schema->string())
                ->min(2)
                ->max(2)
                ->description('Exactly 2 short answer options.')
                ->required(),
            'correctOptionIndex' => $schema->integer()
                ->description('The 0-based index (0 or 1) of the correct option.')
                ->required(),
            'remediationHeading' => $schema->string()
                ->description('A short heading for the remediation slide shown after a wrong answer.')
                ->required(),
            'remediationNarration' => $schema->string()
                ->description('A differently-worded re-teaching of the same concept, for a wrong answer.')
                ->required(),
            'remediationImagePrompt' => $schema->string()
                ->description('Optional short, literal description of the subject matter to illustrate for the remediation slide (no art-style words).')
                ->nullable(),
        ])->withoutAdditionalProperties()->required();
    }
}
