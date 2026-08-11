import { router } from '@inertiajs/react';
import { ArrowDown, ArrowUp, Plus, Sparkles, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { SceneTypePicker } from './scene-type-picker';

export type StoryboardSlideType =
    | 'intro'
    | 'content'
    | 'formula'
    | 'example'
    | 'comparison'
    | 'timeline'
    | 'big_stat'
    | 'definition'
    | 'outro';

export type StoryboardSlide = {
    originalIndex: number;
    type: StoryboardSlideType;
    heading: string;
    narration: string;
    bullets: string[] | null;
    formula: string | null;
    imagePrompt: string | null;
    leftLabel: string | null;
    leftItems: string[] | null;
    rightLabel: string | null;
    rightItems: string[] | null;
    steps: string[] | null;
    statValue: string | null;
    statLabel: string | null;
    term: string | null;
    definition: string | null;
};

export const TYPE_LABEL: Record<StoryboardSlideType, string> = {
    intro: 'Introduction',
    content: 'Content',
    formula: 'Formula',
    example: 'Example',
    comparison: 'Comparison',
    timeline: 'Timeline',
    big_stat: 'Big Stat',
    definition: 'Definition',
    outro: 'Ending',
};

// Every slide type a middle slide can be reclassified to — intro/outro are structurally
// locked to the first/last slide, so they're excluded here.
export const RECLASSIFIABLE_TYPES: StoryboardSlideType[] = [
    'content',
    'example',
    'formula',
    'comparison',
    'timeline',
    'big_stat',
    'definition',
];

// These types never show an illustration slot (see Slide.tsx's dispatcher), so hide the
// image-description field for them.
const NO_IMAGE_TYPES: StoryboardSlideType[] = [
    'formula',
    'outro',
    'comparison',
    'timeline',
    'big_stat',
    'definition',
];

// These types have their own dedicated fields instead of a generic bullet list.
const STRUCTURED_TYPES: StoryboardSlideType[] = [
    'formula',
    'comparison',
    'timeline',
    'big_stat',
    'definition',
];

const EMPTY_TYPE_FIELDS: Omit<
    StoryboardSlide,
    'originalIndex' | 'type' | 'heading' | 'narration'
> = {
    bullets: null,
    formula: null,
    imagePrompt: null,
    leftLabel: null,
    leftItems: null,
    rightLabel: null,
    rightItems: null,
    steps: null,
    statValue: null,
    statLabel: null,
    term: null,
    definition: null,
};

function moveItem<T>(items: T[], from: number, to: number): T[] {
    const next = [...items];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);

    return next;
}

/** A small "add a row / remove a row" editable list, shared by bullets, comparison items, and steps. */
function EditableList({
    items,
    onChange,
    placeholder,
    addLabel,
}: {
    items: string[];
    onChange: (items: string[]) => void;
    placeholder: string;
    addLabel: string;
}) {
    return (
        <div className="space-y-1.5">
            {items.map((item, itemIndex) => (
                <div key={itemIndex} className="flex items-center gap-1.5">
                    <Input
                        value={item}
                        onChange={(e) =>
                            onChange(
                                items.map((current, i) =>
                                    i === itemIndex ? e.target.value : current,
                                ),
                            )
                        }
                        placeholder={placeholder}
                    />
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                            onChange(items.filter((_, i) => i !== itemIndex))
                        }
                    >
                        <X className="size-4" />
                    </Button>
                </div>
            ))}
            <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onChange([...items, ''])}
            >
                <Plus className="size-4" />
                {addLabel}
            </Button>
        </div>
    );
}

export function StoryboardReview({
    slides: initialSlides,
    confirmUrl,
    errors,
    scenePreviews,
}: {
    slides: StoryboardSlide[];
    confirmUrl: string;
    errors: Record<string, string>;
    scenePreviews: Record<string, string | null>;
}) {
    const [slides, setSlides] = useState(initialSlides);
    const [processing, setProcessing] = useState(false);

    function updateSlide(index: number, patch: Partial<StoryboardSlide>) {
        setSlides((current) =>
            current.map((slide, i) =>
                i === index ? { ...slide, ...patch } : slide,
            ),
        );
    }

    function changeSlideType(index: number, type: StoryboardSlideType) {
        updateSlide(index, { ...EMPTY_TYPE_FIELDS, type });
    }

    function removeSlide(index: number) {
        setSlides((current) => current.filter((_, i) => i !== index));
    }

    function submit() {
        setProcessing(true);
        router.post(
            confirmUrl,
            { slides },
            { onFinish: () => setProcessing(false) },
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <Sparkles className="size-5 text-violet-600" />
                <p className="font-display text-lg font-bold text-violet-950 dark:text-white">
                    Review the storyboard
                </p>
            </div>
            <p className="text-sm text-muted-foreground">
                The AI drafted these slides from your document. Edit anything
                that's off, change a slide's scene type, remove a slide, or
                reorder before we narrate and render the video.
            </p>

            <div className="space-y-3">
                {slides.map((slide, index) => {
                    const isLocked = index === 0 || index === slides.length - 1;

                    return (
                        <div
                            key={slide.originalIndex}
                            className="space-y-3 rounded-2xl border border-violet-100 bg-white/70 p-4 shadow-sm dark:border-white/10 dark:bg-white/5"
                        >
                            <div className="flex items-center justify-between gap-2">
                                <span className="flex items-center gap-2">
                                    <span className="flex size-6 items-center justify-center rounded-full bg-violet-100 text-xs font-bold text-violet-700 dark:bg-white/10 dark:text-violet-200">
                                        {index + 1}
                                    </span>
                                    {isLocked ? (
                                        <span className="rounded-full bg-violet-50 px-2.5 py-0.5 text-xs font-semibold text-violet-700 dark:bg-white/10 dark:text-violet-200">
                                            {TYPE_LABEL[slide.type]}
                                        </span>
                                    ) : (
                                        <SceneTypePicker
                                            value={slide.type}
                                            onChange={(type) =>
                                                changeSlideType(index, type)
                                            }
                                            previews={scenePreviews}
                                        />
                                    )}
                                </span>

                                <span className="flex items-center gap-1">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        disabled={index === 0}
                                        onClick={() =>
                                            setSlides((current) =>
                                                moveItem(
                                                    current,
                                                    index,
                                                    index - 1,
                                                ),
                                            )
                                        }
                                    >
                                        <ArrowUp className="size-4" />
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        disabled={index === slides.length - 1}
                                        onClick={() =>
                                            setSlides((current) =>
                                                moveItem(
                                                    current,
                                                    index,
                                                    index + 1,
                                                ),
                                            )
                                        }
                                    >
                                        <ArrowDown className="size-4" />
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        disabled={isLocked}
                                        onClick={() => removeSlide(index)}
                                    >
                                        <Trash2 className="size-4" />
                                    </Button>
                                </span>
                            </div>

                            <div className="space-y-1.5">
                                <Input
                                    value={slide.heading}
                                    onChange={(e) =>
                                        updateSlide(index, {
                                            heading: e.target.value,
                                        })
                                    }
                                    placeholder="Slide heading"
                                />
                                <InputError
                                    message={errors[`slides.${index}.heading`]}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Textarea
                                    value={slide.narration}
                                    onChange={(e) =>
                                        updateSlide(index, {
                                            narration: e.target.value,
                                        })
                                    }
                                    placeholder="What the narrator says"
                                    rows={3}
                                />
                                <InputError
                                    message={
                                        errors[`slides.${index}.narration`]
                                    }
                                />
                            </div>

                            {slide.type === 'formula' && (
                                <Input
                                    value={slide.formula ?? ''}
                                    onChange={(e) =>
                                        updateSlide(index, {
                                            formula: e.target.value,
                                        })
                                    }
                                    placeholder="Formula"
                                />
                            )}

                            {slide.bullets !== null &&
                                !STRUCTURED_TYPES.includes(slide.type) && (
                                    <EditableList
                                        items={slide.bullets}
                                        onChange={(bullets) =>
                                            updateSlide(index, { bullets })
                                        }
                                        placeholder="Bullet point"
                                        addLabel="Add bullet"
                                    />
                                )}

                            {!NO_IMAGE_TYPES.includes(slide.type) && (
                                <Input
                                    value={slide.imagePrompt ?? ''}
                                    onChange={(e) =>
                                        updateSlide(index, {
                                            imagePrompt: e.target.value,
                                        })
                                    }
                                    placeholder="What the illustration should show"
                                />
                            )}

                            {slide.type === 'comparison' && (
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-1.5">
                                        <Input
                                            value={slide.leftLabel ?? ''}
                                            onChange={(e) =>
                                                updateSlide(index, {
                                                    leftLabel: e.target.value,
                                                })
                                            }
                                            placeholder="Left side label"
                                        />
                                        <EditableList
                                            items={slide.leftItems ?? []}
                                            onChange={(leftItems) =>
                                                updateSlide(index, {
                                                    leftItems,
                                                })
                                            }
                                            placeholder="Point"
                                            addLabel="Add point"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Input
                                            value={slide.rightLabel ?? ''}
                                            onChange={(e) =>
                                                updateSlide(index, {
                                                    rightLabel: e.target.value,
                                                })
                                            }
                                            placeholder="Right side label"
                                        />
                                        <EditableList
                                            items={slide.rightItems ?? []}
                                            onChange={(rightItems) =>
                                                updateSlide(index, {
                                                    rightItems,
                                                })
                                            }
                                            placeholder="Point"
                                            addLabel="Add point"
                                        />
                                    </div>
                                </div>
                            )}

                            {slide.type === 'timeline' && (
                                <EditableList
                                    items={slide.steps ?? []}
                                    onChange={(steps) =>
                                        updateSlide(index, { steps })
                                    }
                                    placeholder="Step"
                                    addLabel="Add step"
                                />
                            )}

                            {slide.type === 'big_stat' && (
                                <div className="grid gap-1.5 sm:grid-cols-2">
                                    <Input
                                        value={slide.statValue ?? ''}
                                        onChange={(e) =>
                                            updateSlide(index, {
                                                statValue: e.target.value,
                                            })
                                        }
                                        placeholder="Number/statistic (e.g. 71%)"
                                    />
                                    <Input
                                        value={slide.statLabel ?? ''}
                                        onChange={(e) =>
                                            updateSlide(index, {
                                                statLabel: e.target.value,
                                            })
                                        }
                                        placeholder="Caption"
                                    />
                                </div>
                            )}

                            {slide.type === 'definition' && (
                                <div className="space-y-1.5">
                                    <Input
                                        value={slide.term ?? ''}
                                        onChange={(e) =>
                                            updateSlide(index, {
                                                term: e.target.value,
                                            })
                                        }
                                        placeholder="Term"
                                    />
                                    <Textarea
                                        value={slide.definition ?? ''}
                                        onChange={(e) =>
                                            updateSlide(index, {
                                                definition: e.target.value,
                                            })
                                        }
                                        placeholder="Definition"
                                        rows={2}
                                    />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <InputError message={errors.slides} />

            <div className="flex justify-end">
                <Button
                    type="button"
                    disabled={processing}
                    onClick={submit}
                    data-test="continue-generation-button"
                >
                    {processing
                        ? 'Starting…'
                        : 'Continue to narration & rendering'}
                </Button>
            </div>
        </div>
    );
}
