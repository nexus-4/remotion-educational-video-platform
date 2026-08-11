<?php

namespace App\Enums;

enum VideoStatus: string
{
    case Pending = 'pending';
    case GeneratingStoryboard = 'generating_storyboard';
    case AwaitingReview = 'awaiting_review';
    case GeneratingAudio = 'generating_audio';
    case Rendering = 'rendering';
    case Completed = 'completed';
    case Failed = 'failed';

    public function label(): string
    {
        return match ($this) {
            self::Pending => 'Queued',
            self::GeneratingStoryboard => 'Writing storyboard',
            self::AwaitingReview => 'Ready for review',
            self::GeneratingAudio => 'Recording narration',
            self::Rendering => 'Rendering video',
            self::Completed => 'Completed',
            self::Failed => 'Failed',
        };
    }

    public function isTerminal(): bool
    {
        return match ($this) {
            self::Completed, self::Failed => true,
            default => false,
        };
    }
}
