import { Form, Head } from '@inertiajs/react';
import { Clock3, FileText, ImagePlus, Upload, X, Zap } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
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
type StyleOption = Option & { previewUrl: string | null };

type PageProps = {
    voices: VoiceOption[];
    templates: Option[];
    formats: Option[];
    illustrationStyles: StyleOption[];
    animationStyles: StyleOption[];
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
    const [sourceMode, setSourceMode] = useState<'file' | 'topic'>('file');
    const [topic, setTopic] = useState('');
    const [photos, setPhotos] = useState<File[]>([]);
    const [logo, setLogo] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const photosInputRef = useRef<HTMLInputElement>(null);
    const logoInputRef = useRef<HTMLInputElement>(null);

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

    const syncPhotosInput = (files: File[]) => {
        if (!photosInputRef.current) {
            return;
        }

        const dataTransfer = new DataTransfer();
        files.forEach((file) => dataTransfer.items.add(file));
        photosInputRef.current.files = dataTransfer.files;
    };

    const addPhotos = (files: FileList | null) => {
        if (!files) {
            return;
        }

        const next = [...photos, ...Array.from(files)];
        setPhotos(next);
        syncPhotosInput(next);
    };

    const removePhoto = (index: number) => {
        const next = photos.filter((_, i) => i !== index);
        setPhotos(next);
        syncPhotosInput(next);
    };

    const photoPreviews = useMemo(
        () => photos.map((file) => URL.createObjectURL(file)),
        [photos],
    );

    useEffect(() => {
        return () => {
            photoPreviews.forEach((url) => URL.revokeObjectURL(url));
        };
    }, [photoPreviews]);

    const acceptLogo = (file: File | undefined) => {
        if (!file || !logoInputRef.current) {
            return;
        }

        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        logoInputRef.current.files = dataTransfer.files;
        setLogo(file);
    };

    const logoPreview = useMemo(
        () => (logo ? URL.createObjectURL(logo) : null),
        [logo],
    );

    useEffect(() => {
        return () => {
            if (logoPreview) {
                URL.revokeObjectURL(logoPreview);
            }
        };
    }, [logoPreview]);

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
                        Upload a lesson PDF — or just describe a topic — and
                        we&rsquo;ll turn it into a narrated, animated video for
                        your students.
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

                                        <div className="grid gap-2">
                                            <Label>Source</Label>
                                            <div className="grid grid-cols-2 gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setSourceMode('file')
                                                    }
                                                    className={cn(
                                                        'rounded-xl border-2 px-4 py-2 text-sm font-semibold transition-all',
                                                        sourceMode === 'file'
                                                            ? 'border-violet-500 bg-violet-50/60 text-violet-950 shadow-md dark:bg-violet-500/10 dark:text-white'
                                                            : 'border-transparent bg-white/70 text-muted-foreground hover:border-violet-200 dark:bg-white/5 dark:hover:border-violet-500/30',
                                                    )}
                                                >
                                                    Upload a file
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setSourceMode('topic')
                                                    }
                                                    className={cn(
                                                        'rounded-xl border-2 px-4 py-2 text-sm font-semibold transition-all',
                                                        sourceMode === 'topic'
                                                            ? 'border-violet-500 bg-violet-50/60 text-violet-950 shadow-md dark:bg-violet-500/10 dark:text-white'
                                                            : 'border-transparent bg-white/70 text-muted-foreground hover:border-violet-200 dark:bg-white/5 dark:hover:border-violet-500/30',
                                                    )}
                                                >
                                                    Describe a topic
                                                </button>
                                            </div>
                                        </div>

                                        {sourceMode === 'file' ? (
                                            <div>
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
                                                        setIsDraggingOver(
                                                            false,
                                                        );
                                                        acceptFile(
                                                            event.dataTransfer
                                                                .files[0],
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
                                                                Click to choose
                                                                a different file
                                                            </p>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Upload className="size-8 text-violet-500" />
                                                            <p className="font-medium text-violet-950 dark:text-white">
                                                                Drop your PDF
                                                                here, or click
                                                                to browse
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
                                                                event.target
                                                                    .files?.[0],
                                                            )
                                                        }
                                                    />
                                                </div>
                                                <InputError
                                                    message={errors.pdf}
                                                />
                                            </div>
                                        ) : (
                                            <div className="grid gap-2">
                                                <Label htmlFor="topic">
                                                    What should the video be
                                                    about?
                                                </Label>
                                                <Textarea
                                                    id="topic"
                                                    name="topic"
                                                    value={topic}
                                                    onChange={(event) =>
                                                        setTopic(
                                                            event.target.value,
                                                        )
                                                    }
                                                    placeholder="e.g. The water cycle and how rain forms"
                                                    rows={4}
                                                    required
                                                />
                                                <InputError
                                                    message={errors.topic}
                                                />
                                            </div>
                                        )}

                                        <div className="grid gap-2">
                                            <Label htmlFor="photos">
                                                Add your own photos (optional)
                                            </Label>
                                            <p className="text-xs text-muted-foreground">
                                                Upload photos you&rsquo;d like
                                                to use to illustrate specific
                                                slides — you&rsquo;ll be able to
                                                assign them once you review the
                                                storyboard.
                                            </p>
                                            <input
                                                ref={photosInputRef}
                                                id="photos"
                                                type="file"
                                                name="photos[]"
                                                accept="image/*"
                                                multiple
                                                className="hidden"
                                                onChange={(event) =>
                                                    addPhotos(
                                                        event.target.files,
                                                    )
                                                }
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                className="w-fit"
                                                onClick={() =>
                                                    photosInputRef.current?.click()
                                                }
                                            >
                                                <ImagePlus className="size-4" />
                                                Add photos
                                            </Button>

                                            {photos.length > 0 && (
                                                <div className="flex flex-wrap gap-2">
                                                    {photos.map(
                                                        (file, index) => (
                                                            <div
                                                                key={index}
                                                                className="group relative size-16 overflow-hidden rounded-lg border border-violet-100 dark:border-white/10"
                                                            >
                                                                <img
                                                                    src={
                                                                        photoPreviews[
                                                                            index
                                                                        ]
                                                                    }
                                                                    alt={
                                                                        file.name
                                                                    }
                                                                    className="size-full object-cover"
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        removePhoto(
                                                                            index,
                                                                        )
                                                                    }
                                                                    className="absolute top-0.5 right-0.5 flex size-5 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
                                                                >
                                                                    <X className="size-3" />
                                                                </button>
                                                            </div>
                                                        ),
                                                    )}
                                                </div>
                                            )}
                                            <InputError
                                                message={errors.photos}
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="logo">
                                                Institution logo (optional)
                                            </Label>
                                            <p className="text-xs text-muted-foreground">
                                                Shown in the bottom-right corner
                                                throughout the video.
                                            </p>
                                            <input
                                                ref={logoInputRef}
                                                id="logo"
                                                type="file"
                                                name="logo"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={(event) =>
                                                    acceptLogo(
                                                        event.target.files?.[0],
                                                    )
                                                }
                                            />
                                            <div className="flex items-center gap-3">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    className="w-fit"
                                                    onClick={() =>
                                                        logoInputRef.current?.click()
                                                    }
                                                >
                                                    <ImagePlus className="size-4" />
                                                    {logo
                                                        ? 'Replace logo'
                                                        : 'Add logo'}
                                                </Button>

                                                {logoPreview && (
                                                    <img
                                                        src={logoPreview}
                                                        alt={logo?.name}
                                                        className="size-12 rounded-lg border border-violet-100 object-contain dark:border-white/10"
                                                    />
                                                )}
                                            </div>
                                            <InputError message={errors.logo} />
                                        </div>
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
                                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                                {illustrationStyles.map(
                                                    (option) => (
                                                        <StyleSwatch
                                                            key={option.value}
                                                            value={option.value}
                                                            label={option.label}
                                                            previewUrl={
                                                                option.previewUrl
                                                            }
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
                                                            previewUrl={
                                                                option.previewUrl
                                                            }
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
                                                    <dt>
                                                        {sourceMode === 'file'
                                                            ? 'File'
                                                            : 'Topic'}
                                                    </dt>
                                                    <dd className="truncate text-right">
                                                        {sourceMode === 'file'
                                                            ? (fileName ??
                                                              'No file chosen')
                                                            : topic.trim() ||
                                                              'No topic entered'}
                                                    </dd>
                                                </div>
                                                {photos.length > 0 && (
                                                    <div className="flex justify-between gap-4">
                                                        <dt>Photos</dt>
                                                        <dd>
                                                            {photos.length}{' '}
                                                            added
                                                        </dd>
                                                    </div>
                                                )}
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
                                                    step === 0 &&
                                                    (sourceMode === 'file'
                                                        ? !fileName
                                                        : !topic.trim())
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
