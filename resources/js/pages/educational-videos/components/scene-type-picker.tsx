import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { RECLASSIFIABLE_TYPES, TYPE_LABEL } from './storyboard-review';
import type { StoryboardSlideType } from './storyboard-review';

type SceneTypePickerProps = {
    value: StoryboardSlideType;
    onChange: (type: StoryboardSlideType) => void;
    previews: Record<string, string | null>;
};

/**
 * A real-screenshot preview picker for a slide's scene type — the visual equivalent of
 * the voice-sample player, so you can see what a scene looks like before picking it.
 */
export function SceneTypePicker({
    value,
    onChange,
    previews,
}: SceneTypePickerProps) {
    const [open, setOpen] = useState(false);

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="flex items-center gap-2 overflow-hidden rounded-full border border-violet-100 bg-violet-50 py-0.5 pr-2.5 pl-0.5 text-xs font-semibold text-violet-700 hover:border-violet-300 dark:border-white/10 dark:bg-white/10 dark:text-violet-200"
            >
                {previews[value] ? (
                    <img
                        src={previews[value]}
                        alt=""
                        className="h-5 w-9 rounded-full object-cover"
                    />
                ) : null}
                {TYPE_LABEL[value]}
                <ChevronDown className="size-3" />
            </button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Choose a scene type</DialogTitle>
                    </DialogHeader>

                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {RECLASSIFIABLE_TYPES.map((type) => (
                            <button
                                key={type}
                                type="button"
                                onClick={() => {
                                    onChange(type);
                                    setOpen(false);
                                }}
                                className={cn(
                                    'flex flex-col gap-2 rounded-2xl border-2 p-2 text-left transition-all',
                                    type === value
                                        ? 'border-violet-500 bg-violet-50/60 shadow-md dark:bg-violet-500/10'
                                        : 'border-transparent bg-white/70 hover:border-violet-200 dark:bg-white/5 dark:hover:border-violet-500/30',
                                )}
                            >
                                <div className="aspect-video overflow-hidden rounded-lg bg-violet-100 dark:bg-white/10">
                                    {previews[type] ? (
                                        <img
                                            src={previews[type]}
                                            alt={`${TYPE_LABEL[type]} scene preview`}
                                            className="size-full object-cover"
                                        />
                                    ) : null}
                                </div>
                                <span className="text-xs font-semibold text-violet-950 dark:text-white">
                                    {TYPE_LABEL[type]}
                                </span>
                            </button>
                        ))}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
