<?php

namespace App\Enums;

enum IllustrationStyle: string
{
    case AcademicDiagram = 'academic_diagram';
    case FlatIllustration = 'flat_illustration';
    case HandDrawnSketch = 'hand_drawn_sketch';

    public function label(): string
    {
        return match ($this) {
            self::AcademicDiagram => 'Academic Diagram',
            self::FlatIllustration => 'Flat Illustration',
            self::HandDrawnSketch => 'Hand-Drawn Sketch',
        };
    }

    /**
     * The rendering-style instructions appended to every illustration prompt for this
     * style, regardless of what the model wrote for the subject matter — keeps the
     * visuals consistent within a style and away from generic "AI art" look.
     */
    public function stylePrompt(): string
    {
        return match ($this) {
            self::AcademicDiagram => 'Render as a clean academic textbook diagram or scientific '
                .'illustration: flat vector line art, precise and minimal, like a figure from a science '
                .'textbook or educational poster. No text, no labels, no watermarks, no photorealism, no '
                .'glossy 3D render, no cute cartoon characters, mascots, or smiling faces.',

            self::FlatIllustration => 'Render as a simple, colorful flat illustration: friendly and '
                .'approachable, minimal shading, clean geometric shapes, suitable for a children\'s '
                .'educational video. No text, no labels, no watermarks, no photorealism.',

            self::HandDrawnSketch => 'Render as a hand-drawn pencil or ink sketch: loose expressive '
                .'lines, like a doodle in a student\'s notebook margin, mostly black and white with '
                .'sparing color accents. No text, no labels, no watermarks, no photorealism.',
        };
    }
}
