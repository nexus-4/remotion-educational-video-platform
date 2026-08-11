<?php

namespace App\Enums;

enum VideoTemplate: string
{
    case NotebookLm = 'notebook_lm';
    case StandardLecture = 'standard_lecture';
    case CleanMinimal = 'clean_minimal';

    public function label(): string
    {
        return match ($this) {
            self::NotebookLm => 'NotebookLM Style',
            self::StandardLecture => 'Standard Lecture',
            self::CleanMinimal => 'Clean Minimal',
        };
    }

    public function description(): string
    {
        return match ($this) {
            self::NotebookLm => 'Conversational, source-highlighting layout inspired by NotebookLM.',
            self::StandardLecture => 'Classic slide-and-narration classroom lecture layout.',
            self::CleanMinimal => 'Airy white background with soft pastel accents — a modern, minimal look.',
        };
    }
}
