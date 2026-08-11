import { cn } from '@/lib/utils';

type TemplatePreviewCardProps = {
    value: string;
    label: string;
    selected: boolean;
    onSelect: () => void;
};

const PREVIEW: Record<
    string,
    { frame: string; badge: string; bar: string; description: string }
> = {
    notebook_lm: {
        frame: 'bg-gradient-to-br from-amber-100 via-orange-50 to-rose-100',
        badge: 'bg-orange-200 text-orange-800',
        bar: 'bg-slate-800/70',
        description: 'Warm, conversational — like a friendly study companion.',
    },
    standard_lecture: {
        frame: 'bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950',
        badge: 'bg-indigo-500/30 text-indigo-100',
        bar: 'bg-white/80',
        description: 'Clear, structured — a classic classroom lecture feel.',
    },
    clean_minimal: {
        frame: 'bg-gradient-to-br from-white via-slate-50 to-violet-50',
        badge: 'bg-violet-100 text-violet-700',
        bar: 'bg-slate-800/60',
        description: 'Airy and minimal — plenty of whitespace, pastel accents.',
    },
};

/** A small CSS-only mockup of what a video in this template actually looks like. */
export function TemplatePreviewCard({
    value,
    label,
    selected,
    onSelect,
}: TemplatePreviewCardProps) {
    const preview = PREVIEW[value] ?? PREVIEW.standard_lecture;

    return (
        <button
            type="button"
            onClick={onSelect}
            className={cn(
                'group flex flex-col gap-3 rounded-2xl border-2 p-3 text-left transition-all',
                selected
                    ? 'border-violet-500 bg-violet-50/60 shadow-md dark:bg-violet-500/10'
                    : 'border-transparent bg-white/70 hover:border-violet-200 dark:bg-white/5 dark:hover:border-violet-500/30',
            )}
        >
            <div
                className={cn(
                    'flex aspect-video w-full flex-col justify-end gap-2 rounded-xl p-4',
                    preview.frame,
                )}
            >
                <span
                    className={cn(
                        'w-fit rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase',
                        preview.badge,
                    )}
                >
                    Intro
                </span>
                <div className={cn('h-2 w-3/4 rounded-full', preview.bar)} />
                <div
                    className={cn(
                        'h-2 w-1/2 rounded-full opacity-70',
                        preview.bar,
                    )}
                />
            </div>

            <div>
                <p className="font-display text-sm font-bold text-violet-950 dark:text-white">
                    {label}
                </p>
                <p className="text-xs text-muted-foreground">
                    {preview.description}
                </p>
            </div>
        </button>
    );
}
