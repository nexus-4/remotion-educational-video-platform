<?php

namespace App\Enums;

/**
 * Maps to the voice identifiers supported by OpenAI's TTS models.
 */
enum VoiceType: string
{
    case Alloy = 'alloy';
    case Echo = 'echo';
    case Fable = 'fable';
    case Nova = 'nova';
    case Onyx = 'onyx';
    case Shimmer = 'shimmer';

    public function label(): string
    {
        return match ($this) {
            self::Alloy => 'Alloy (Neutral)',
            self::Echo => 'Echo (Warm Male)',
            self::Fable => 'Fable (Bright, Expressive)',
            self::Nova => 'Nova (Friendly Female)',
            self::Onyx => 'Onyx (Deep Male)',
            self::Shimmer => 'Shimmer (Soft Female)',
        };
    }
}
