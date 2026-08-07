<?php

namespace App\Enums;

enum VideoFormat: string
{
    case Short = 'short';
    case DeepDive = 'deep_dive';

    public function label(): string
    {
        return match ($this) {
            self::Short => 'Short (2-4 minutes)',
            self::DeepDive => 'Deep Dive (8-12 minutes)',
        };
    }

    /**
     * The minimum number of slides the storyboard should contain for this format.
     */
    public function minimumSlides(): int
    {
        return match ($this) {
            self::Short => 5,
            self::DeepDive => 9,
        };
    }

    /**
     * The maximum number of slides the storyboard should contain for this format.
     */
    public function maximumSlides(): int
    {
        return match ($this) {
            self::Short => 6,
            self::DeepDive => 12,
        };
    }
}
