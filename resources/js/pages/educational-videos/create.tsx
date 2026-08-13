import { Form, Head } from '@inertiajs/react';
import { Clock3, FileText, Upload, Zap } from 'lucide-react';
import { useRef, useState } from 'react';
import EducationalVideoController from '@/actions/App/Http/Controllers/EducationalVideoController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { StyleSwatch } from './components/style-swatch';
import { TemplatePreviewCard } from './components/template-preview-card';
import { VoiceCard } from './components/voice-card';
import { WizardSteps } from './components/wizard-steps';

type Option = {
    value: string;
    label: string;
};

type VoiceOption = Option & { sampleUrl: string | null };

type PageProps = {
    voices: VoiceOption[];
    templates: Option[];
    formats: Option[];
    illustrationStyles: Option[];
    animationStyles: Option[];
};

const STEPS = ['Upload', 'Template', 'Voice & style', 'Review'];

const FORMAT_ICON: Record<string, typeof Zap> = {
    short: Zap,
    deep_dive: Clock3,
};

export default function CreateEducationalVideo({
    voices,
    templates,
    formats,
    illustrationStyles,
    animationStyles,
}: PageProps) {
    const [step, setStep] = useState(0);
    const [fileName, setFileName] = useState<string | null>(null);
    const [isDraggingOver, setIsDraggingOver] = useState(false);
    const [voice, setVoice] = useState(voices[0]?.value ?? '');
    const [template, setTemplate] = useState(templates[0]?.value ?? '');
    const [format, setFormat] = useState(formats[0]?.value ?? '');
    const [illustrationStyle, setIllustrationStyle] = useState(
        illustrationStyles[0]?.value ?? '',
    );
    const [animationStyle, setAnimationStyle] = useState(
        animationStyles[0]?.value ?? '',
    );
    const [interactive, setInteractive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const goNext = () =>
        setStep((current) => Math.min(current + 1, STEPS.length - 1));
    const goBack = () => setStep((current) => Math.max(current - 1, 0));

    const acceptFile = (file: File | undefined) => {
        if (!file || !fileInputRef.current) {
            return;
        }

        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        fileInputRef.current.files = dataTransfer.files;
        setFileName(file.name);
    };

    const stepPanelClass = (index: number) =>
        cn('space-y-6', step === index ? 'block' : 'hidden');

    return (
        <>
            <Head title="Create an educational video" />

            <div className="mx-auto max-w-3xl space-y-8">
                <div>
                    <h1 className="font-display text-3xl font-extrabold text-violet-950 dark:text-white">
                        Let&rsquo;s make a video
                    </h1>
                    <p className="mt-1 text-muted-foreground">
                        Upload a lesson PDF and we&rsquo;ll turn it into a
                        narrated, animated video for your students.
                    </p>
                </div>

                <div className="rounded-3xl border border-violet-100 bg-white/70 p-6 shadow-sm backdrop-blur sm:p-8 dark:border-white/10 dark:bg-white/5">
                    <WizardSteps steps={STEPS} currentStep={step} />

                    <Form
                        {...EducationalVideoController.store.form()}
                        options={{ preserveScroll: true }}
                        className="mt-8"
                    >
                        {({ processing, errors }) => {
                            const hasErrors = Object.keys(errors).length > 0;

                            return (
                                <>
                                    {hasErrors && (
                                        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
                                            <p className="font-semibold">
                                                Please fix the following before
                                                generating:
                                            </p>
                                            <ul className="mt-2 list-inside list-disc space-y-1">
                                                {Object.values(errors).map(
                                                    (message) => (
                                                        <li key={message}>
                                                            {message}
                                                        </li>
                                                    ),
                                                )}
                                            </ul>
                                        </div>
                                    )}

                                    <input
                                        type="hidden"
                                        name="voice"
                                        value={voice}
                                    />
                                    <input
                                        type="hidden"
                                        name="template"
                                        value={template}
                                    />
                                    <input
                                        type="hidden"
                                        name="format"
                                        value={format}
                                    />
                                    <input
                                        type="hidden"
                                        name="illustration_style"
                                        value={illustrationStyle}
                                    />
                                    <input
                                        type="hidden"
                                        name="animation_style"
                                        value={animationStyle}
                                    />
                                    <input
                                        type="hidden"
                                        name="interactive"
                                        value={interactive ? '1' : '0'}
                                    />

                                    {/* Step 1: Upload */}
                                    <div className={stepPanelClass(0)}>
                                        <div className="grid gap-2">
                                            <Label htmlFor="title">
                                                Title (optional)
                                            </Label>
                                            <Input
                                                id="title"
                                                name="title"
                                                placeholder="e.g. The Water Cycle"
                                            />
                                            <InputError
                                                message={errors.title}
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="content_focus">
                                                Anything specific this video
                                                should focus on? (optional)
                                            </Label>
                                            <Textarea
                                                id="content_focus"
                                                name="content_focus"
                                                placeholder="e.g. Focus on the causes, not just the timeline"
                                                rows={2}
                                            />
                                            <InputError
                                                message={errors.content_focus}
                                            />
                                        </div>

                                        <div
                                            onDragOver={(event) => {
                                                event.preventDefault();
                                                setIsDraggingOver(true);
                                            }}
                                            onDragLeave={() =>
                                                setIsDraggingOver(false)
                                            }
                                            onDrop={(event) => {
                                                event.preventDefault();
                                                setIsDraggingOver(false);
                                                acceptFile(
                                                    event.dataTransfer.files[0],
                                                );
                                            }}
                                            onClick={() =>
                                                fileInputRef.current?.click()
                                            }
                                            className={cn(
                                                'flex cursor-pointer flex-col items-center gap-3 rounded-2xl border-2 border-dashed p-10 text-center transition-colors',
                                                isDraggingOver
                                                    ? 'border-violet-500 bg-violet-50 dark:bg-violet-500/10'
                                                    : 'border-violet-200 hover:border-violet-400 dark:border-white/15',
                                            )}
                                        >
                                            {fileName ? (
                                                <>
                                                    <FileText className="size-8 text-violet-600" />
                                                    <p className="font-medium text-violet-950 dark:text-white">
                                                        {fileName}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        Click to choose a
                                                        different file
                                                    </p>
                                                </>
                                            ) : (
                                                <>
                                                    <Upload className="size-8 text-violet-500" />
                                                    <p className="font-medium text-violet-950 dark:text-white">
                                                        Drop your PDF here, or
                                                        click to browse
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        PDF, up to 20MB
                                                    </p>
                                                </>
                                            )}

                                            <input
                                                ref={fileInputRef}
                                                id="pdf"
                                                type="file"
                                                name="pdf"
                                                accept="application/pdf"
                                                required
                                                className="hidden"
                                                onChange={(event) =>
                                                    acceptFile(
                                                        event.target.files?.[0],
                                                    )
                                                }
                                            />
                                        </div>
                                        <InputError message={errors.pdf} />
                                    </div>

                                    {/* Step 2: Template */}
                                    <div className={stepPanelClass(1)}>
                                        <Label>Template</Label>
                                        <div className="grid gap-4 sm:grid-cols-2">
                                            {templates.map((option) => (
                                                <TemplatePreviewCard
                                                    key={option.value}
                                                    value={option.value}
                                                    label={option.label}
                                                    selected={
                                                        template ===
                                                        option.value
                                                    }
                                                    onSelect={() =>
                                                        setTemplate(
                                                            option.value,
                                                        )
                                                    }
                                                />
                                            ))}
                                        </div>
                                        <InputError message={errors.template} />
                                    </div>

                                    {/* Step 3: Voice & style */}
                                    <div className={stepPanelClass(2)}>
                                        <div className="space-y-3">
                                            <Label>Narrator voice</Label>
                                            <div className="grid gap-3 sm:grid-cols-2">
                                                {voices.map((option) => (
                                                    <VoiceCard
                                                        key={option.value}
                                                        value={option.value}
                                                        label={option.label}
                                                        sampleUrl={
                                                            option.sampleUrl
                                                        }
                                                        selected={
                                                            voice ===
                                                            option.value
                                                        }
                                                        onSelect={() =>
                                                            setVoice(
                                                                option.value,
                                                            )
                                                        }
                                                    />
                                                ))}
                                            </div>
                                            <InputError
                                                message={errors.voice}
                                            />
                                        </div>

                                        <div className="space-y-3">
                                            <Label>Illustration style</Label>
                                            <div className="grid grid-cols-3 gap-3">
                                                {illustrationStyles.map(
                                                    (option) => (
                                                        <StyleSwatch
                                                            key={option.value}
                                                            value={option.value}
                                                            label={option.label}
                                                            selected={
                                                                illustrationStyle ===
                                                                option.value
                                                            }
                                                            onSelect={() =>
                                                                setIllustrationStyle(
                                                                    option.value,
                                                                )
                                                            }
                                                        />
                                                    ),
                                                )}
                                            </div>
                                            <InputError
                                                message={
                                                    errors.illustration_style
                                                }
                                            />
                                        </div>

                                        <div className="space-y-3">
                                            <Label>Emphasis animation</Label>
                                            <div className="grid grid-cols-3 gap-3">
                                                {animationStyles.map(
                                                    (option) => (
                                                        <StyleSwatch
                                                            key={option.value}
                                                            value={option.value}
                                                            label={option.label}
                                                            selected={
                                                                animationStyle ===
                                                                option.value
                                                            }
                                                            onSelect={() =>
                                                                setAnimationStyle(
                                                                    option.value,
                                                                )
                                                            }
                                                        />
                                                    ),
                                                )}
                                            </div>
                                            <InputError
                                                message={errors.animation_style}
                                            />
                                        </div>
                                    </div>

                                    {/* Step 4: Format & review */}
                                    <div className={stepPanelClass(3)}>
                                        <div className="space-y-3">
                                            <Label>Video length</Label>
                                            <div className="grid gap-3 sm:grid-cols-2">
                                                {formats.map((option) => {
                                                    const Icon =
                                                        FORMAT_ICON[
                                                            option.value
                                                        ] ?? Zap;

                                                    return (
                                                        <button
                                                            key={option.value}
                                                            type="button"
                                                            onClick={() =>
                                                                setFormat(
                                                                    option.value,
                                                                )
                                                            }
                                                            className={cn(
                                                                'flex items-center gap-3 rounded-2xl border-2 p-4 text-left transition-all',
                                                                format ===
                                                                    option.value
                                                                    ? 'border-violet-500 bg-violet-50/60 shadow-md dark:bg-violet-500/10'
                                                                    : 'border-transparent bg-white/70 hover:border-violet-200 dark:bg-white/5 dark:hover:border-violet-500/30',
                                                            )}
                                                        >
                                                            <Icon className="size-5 text-violet-600 dark:text-violet-300" />
                                                            <span className="text-sm font-semibold text-violet-950 dark:text-white">
                                                                {option.label}
                                                            </span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                            <InputError
                                                message={errors.format}
                                            />
                                        </div>

                                        <div className="flex items-start gap-3 rounded-2xl border-2 border-violet-100 p-4 dark:border-white/10">
                                            <Checkbox
                                                id="interactive"
                                                checked={interactive}
                                                onCheckedChange={(checked) =>
                                                    setInteractive(
                                                        checked === true,
                                                    )
                                                }
                                                className="mt-0.5"
                                            />
                                            <div className="grid gap-1">
                                                <Label
                                                    htmlFor="interactive"
                                                    className="cursor-pointer"
                                                >
                                                    Make it interactive
                                                </Label>
                                                <p className="text-xs text-muted-foreground">
                                                    Pauses once for a quick
                                                    comprehension question. A
                                                    wrong answer gets a short
                                                    re-explanation before the
                                                    video continues.
                                                </p>
                                            </div>
                                            <InputError
                                                message={errors.interactive}
                                            />
                                        </div>

                                        <div className="rounded-2xl bg-violet-50/70 p-5 text-sm dark:bg-white/5">
                                            <p className="font-display mb-2 font-bold text-violet-950 dark:text-white">
                                                Ready to generate
                                            </p>
                                            <dl className="space-y-1 text-muted-foreground">
                                                <div className="flex justify-between gap-4">
                                                    <dt>File</dt>
                                                    <dd className="truncate text-right">
                                                        {fileName ??
                                                            'No file chosen'}
                                                    </dd>
                                                </div>
                                                <div className="flex justify-between gap-4">
                                                    <dt>Template</dt>
                                                    <dd>
                                                        {templates.find(
                                                            (option) =>
                                                                option.value ===
                                                                template,
                                                        )?.label ?? '—'}
                                                    </dd>
                                                </div>
                                                <div className="flex justify-between gap-4">
                                                    <dt>Voice</dt>
                                                    <dd>
                                                        {voices.find(
                                                            (option) =>
                                                                option.value ===
                                                                voice,
                                                        )?.label ?? '—'}
                                                    </dd>
                                                </div>
                                            </dl>
                                        </div>

                                        <div className="flex justify-end">
                                            <Button
                                                type="submit"
                                                disabled={processing}
                                                data-test="generate-video-button"
                                            >
                                                {processing
                                                    ? 'Generating…'
                                                    : 'Generate video'}
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="mt-8 flex items-center justify-between border-t border-violet-100 pt-6 dark:border-white/10">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            onClick={goBack}
                                            disabled={step === 0}
                                        >
                                            Back
                                        </Button>

                                        {step < STEPS.length - 1 && (
                                            <Button
                                                type="button"
                                                onClick={goNext}
                                                disabled={
                                                    step === 0 && !fileName
                                                }
                                            >
                                                Next
                                            </Button>
                                        )}
                                    </div>
                                </>
                            );
                        }}
                    </Form>
                </div>
            </div>
        </>
    );
}
