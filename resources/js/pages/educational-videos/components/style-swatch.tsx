import {
    BookOpen,
    Camera,
    Highlighter,
    Palette,
    PenLine,
    PenTool,
    Sparkles,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

type StyleSwatchProps = {
    value: string;
    label: string;
    description?: string;
    previewUrl?: string | null;
    selected: boolean;
    onSelect: () => void;
};

const ICON: Record<string, LucideIcon> = {
    academic_diagram: BookOpen,
    flat_illustration: Palette,
    hand_drawn_sketch: PenTool,
    photorealistic: Camera,
    highlight: Highlighter,
    underline: PenLine,
    pop_in: Sparkles,
};

/** A small icon+label preview chip used for illustration-style and animation-style picks. */
export function StyleSwatch({
    value,
    label,
    description,
    previewUrl,
    selected,
    onSelect,
}: StyleSwatchProps) {
    const [isHovered, setIsHovered] = useState(false);
    const Icon = ICON[value] ?? Sparkles;
    const isVideoPreview = previewUrl?.endsWith('.mp4') ?? false;

    return (
        <div
            className="relative"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <button
                type="button"
                onClick={onSelect}
                title={description}
                className={cn(
                    'flex w-full flex-col items-center gap-2 rounded-2xl border-2 px-4 py-4 text-center transition-all',
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

            {previewUrl && isHovered && (
                <div className="pointer-events-none absolute inset-x-0 bottom-full z-10 mb-2 flex justify-center">
                    <div className="overflow-hidden rounded-xl border border-violet-100 bg-white p-1 shadow-lg dark:border-white/10 dark:bg-zinc-900">
                        {isVideoPreview ? (
                            <video
                                src={previewUrl}
                                autoPlay
                                loop
                                muted
                                playsInline
                                className="h-24 w-40 rounded-lg object-cover"
                            />
                        ) : (
                            <img
                                src={previewUrl}
                                alt={`${label} preview`}
                                className="h-24 w-40 rounded-lg object-cover"
                            />
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
