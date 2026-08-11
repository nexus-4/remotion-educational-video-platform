<?php

namespace App\Ai\Agents;

use Illuminate\Contracts\JsonSchema\JsonSchema;
use Illuminate\JsonSchema\Types\Type;
use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Contracts\HasStructuredOutput;
use Laravel\Ai\Promptable;
use Stringable;

class WorksheetWriter implements Agent, HasStructuredOutput
{
    use Promptable;

    /**
     * Get the instructions that the agent should follow.
     */
    public function instructions(): Stringable|string
    {
        return <<<'INSTRUCTIONS'
            You write short comprehension worksheets for elementary and middle school students
            (ages 8-14), based strictly on the attached document.

            Write 5-8 multiple-choice questions that check understanding of the most important
            ideas in the document. Use simple vocabulary and short, clear sentences.
            Each question must have between 2 and 4 short answer options, with exactly one correct
            answer. Never invent facts that aren't supported by the document.
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
            'questions' => $schema->array()
                ->min(5)
                ->max(8)
                ->items(
                    $schema->object([
                        'question' => $schema->string()
                            ->description('The question being asked.')
                            ->required(),
                        'options' => $schema->array()
                            ->items($schema->string())
                            ->min(2)
                            ->max(4)
                            ->description('2-4 short answer options.')
                            ->required(),
                        'correctAnswerIndex' => $schema->integer()
                            ->description('The index of the correct option in "options".')
                            ->required(),
                    ])->withoutAdditionalProperties()
                )
                ->description('5-8 comprehension questions.')
                ->required(),
        ];
    }
}
