<?php

namespace App\Enums;

enum AnimationStyle: string
{
    case Highlight = 'highlight';
    case Underline = 'underline';
    case PopIn = 'pop_in';

    public function label(): string
    {
        return match ($this) {
            self::Highlight => 'Highlight Sweep',
            self::Underline => 'Underline Draw',
            self::PopIn => 'Pop In',
        };
    }

    public function description(): string
    {
        return match ($this) {
            self::Highlight => 'A marker-style highlight sweeps across each key term as it\'s spoken.',
            self::Underline => 'A clean underline draws itself beneath each key term as it\'s spoken.',
            self::PopIn => 'Each key term pops and bounces into view as it\'s spoken.',
        };
    }
}
