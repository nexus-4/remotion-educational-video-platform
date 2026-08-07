import {
    BookOpen,
    Highlighter,
    Palette,
    PenLine,
    PenTool,
    Sparkles,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type StyleSwatchProps = {
    value: string;
    label: string;
    description?: string;
    selected: boolean;
    onSelect: () => void;
};

const ICON: Record<string, LucideIcon> = {
    academic_diagram: BookOpen,
    flat_illustration: Palette,
    hand_drawn_sketch: PenTool,
    highlight: Highlighter,
    underline: PenLine,
    pop_in: Sparkles,
};

/** A small icon+label preview chip used for illustration-style and animation-style picks. */
export function StyleSwatch({
    value,
    label,
    description,
    selected,
    onSelect,
}: StyleSwatchProps) {
    const Icon = ICON[value] ?? Sparkles;

    return (
        <button
            type="button"
            onClick={onSelect}
            title={description}
            className={cn(
                'flex flex-col items-center gap-2 rounded-2xl border-2 px-4 py-4 text-center transition-all',
                selected
                    ? 'border-violet-500 bg-violet-50/60 shadow-md dark:bg-violet-500/10'
                    : 'border-transparent bg-white/70 hover:border-violet-200 dark:bg-white/5 dark:hover:border-violet-500/30',
            )}
        >
            <span
                className={cn(
                    'flex size-10 items-center justify-center rounded-full',
                    selected
                        ? 'bg-violet-600 text-white'
                        : 'bg-violet-100 text-violet-700 dark:bg-white/10 dark:text-violet-200',
                )}
            >
                <Icon className="size-5" />
            </span>
            <span className="text-xs font-semibold text-violet-950 dark:text-white">
                {label}
            </span>
        </button>
    );
}
