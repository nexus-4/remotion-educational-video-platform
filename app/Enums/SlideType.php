<?php

namespace App\Enums;

enum SlideType: string
{
    case Intro = 'intro';
    case Content = 'content';
    case Formula = 'formula';
    case Example = 'example';
    case Comparison = 'comparison';
    case Timeline = 'timeline';
    case BigStat = 'big_stat';
    case Definition = 'definition';
    case Outro = 'outro';

    public function label(): string
    {
        return match ($this) {
            self::Intro => 'Introduction',
            self::Content => 'Content',
            self::Formula => 'Formula',
            self::Example => 'Example',
            self::Comparison => 'Comparison',
            self::Timeline => 'Timeline',
            self::BigStat => 'Big Stat',
            self::Definition => 'Definition',
            self::Outro => 'Ending',
        };
    }
}
