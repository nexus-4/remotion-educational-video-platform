<?php

namespace App\Enums;

enum SlideType: string
{
    case Intro = 'intro';
    case Content = 'content';
    case Formula = 'formula';
    case Example = 'example';

    public function label(): string
    {
        return match ($this) {
            self::Intro => 'Introduction',
            self::Content => 'Content',
            self::Formula => 'Formula',
            self::Example => 'Example',
        };
    }
}
