import { Head, router, usePage, usePoll } from '@inertiajs/react';
import {
    AlertCircle,
    Clapperboard,
    ClipboardCheck,
    ClipboardList,
    Download,
    Mic,
    PenLine,
    RotateCcw,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import EducationalVideoController from '@/actions/App/Http/Controllers/EducationalVideoController';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { StoryboardSlide } from './components/storyboard-review';
import { StoryboardReview } from './components/storyboard-review';

type EducationalVideoStatus =
    | 'pending'
    | 'generating_storyboard'
    | 'awaiting_review'
    | 'generating_audio'
    | 'rendering'
    | 'completed'
    | 'failed';

type PageProps = {
    video: {
        id: number;
        title: string | null;
        status: EducationalVideoStatus;
        statusLabel: string;
        progress: string | null;
        error: string | null;
        videoUrl: string | null;
        hasWorksheet: boolean;
        scenePreviews: Record<string, string | null>;
        slides: StoryboardSlide[];
    };
};

const STAGES: {
    key: EducationalVideoStatus;
    label: string;
    icon: LucideIcon;
}[] = [
    {
        key: 'generating_storyboard',
        label: 'Writing storyboard',
        icon: PenLine,
    },
    {
        key: 'awaiting_review',
        label: 'Ready for your review',
        icon: ClipboardCheck,
    },
    { key: 'generating_audio', label: 'Narrating & illustrating', icon: Mic },
    { key: 'rendering', label: 'Rendering video', icon: Clapperboard },
];

function StageProgress({ status }: { status: EducationalVideoStatus }) {
    const currentIndex = STAGES.findIndex((stage) => stage.key === status);
    const isComplete = status === 'completed';

    return (
        <div className="flex flex-col gap-4">
            {STAGES.map((stage, index) => {
                const isDone = isComplete || index < currentIndex;
                const isCurrent = !isComplete && index === currentIndex;
                const Icon = stage.icon;

                return (
                    <div key={stage.key} className="flex items-center gap-3">
                        <span
                            className={cn(
                                'flex size-10 items-center justify-center rounded-full transition-colors',
                                isDone && 'bg-violet-600 text-white',
                                isCurrent &&
                                    'animate-pulse bg-violet-600 text-white',
                                !isDone &&
                                    !isCurrent &&
                                    'bg-violet-100 text-violet-400 dark:bg-white/10 dark:text-violet-300',
                            )}
                        >
                            <Icon className="size-5" />
                        </span>
                        <span
                            className={cn(
                                'text-sm font-medium',
                                isDone || isCurrent
                                    ? 'text-violet-950 dark:text-white'
                                    : 'text-muted-foreground',
                            )}
                        >
                            {stage.label}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}

export default function ShowEducationalVideo({ video }: PageProps) {
    const { errors } = usePage<{ errors: Record<string, string> }>().props;
    const [isGeneratingWorksheet, setIsGeneratingWorksheet] = useState(false);

    const isTerminal =
        video.status === 'completed' || video.status === 'failed';
    const isAwaitingReview = video.status === 'awaiting_review';

    const { stop } = usePoll(
        3000,
        {},
        {
            autoStart: !isTerminal && !isAwaitingReview,
            // `keepAlive` is required here — Inertia pauses polling by default while the tab
            // is in the background, which would otherwise leave this page stuck showing a
            // stale in-progress state until the user manually reloads.
            keepAlive: true,
            // `mode: 'cancel'` is required too — Inertia's default `'overlap'` mode lets
            // multiple poll responses be in flight at once with no guarantee they get
            // *applied* in the order they were *sent*. Over a multi-minute render, an
            // earlier "still rendering" response can resolve after a later "completed"
            // one and silently overwrite it. `cancel` guarantees only the latest response
            // is ever applied.
            mode: 'cancel',
        },
    );

    useEffect(() => {
        if (isTerminal || isAwaitingReview) {
            stop();
        }
    }, [isTerminal, isAwaitingReview, stop]);

    const hasOutline = video.slides.length > 0 && !isAwaitingReview;

    return (
        <>
            <Head title={video.title ?? 'Generating video'} />

            <div className="space-y-6">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h1 className="font-display text-3xl font-extrabold text-violet-950 dark:text-white">
                            {video.title ?? 'Your video'}
                        </h1>
                        <p className="mt-1 text-muted-foreground">
                            {video.statusLabel}
                        </p>
                    </div>

                    {video.status === 'completed' && video.videoUrl && (
                        <div className="flex items-center gap-2">
                            {video.hasWorksheet ? (
                                <a
                                    href={
                                        EducationalVideoController.showWorksheet(
                                            video.id,
                                        ).url
                                    }
                                    target="_blank"
                                    rel="noreferrer"
                                    className={buttonVariants({
                                        variant: 'outline',
                                    })}
                                >
                                    <ClipboardList />
                                    View worksheet
                                </a>
                            ) : (
                                <Button
                                    type="button"
                                    variant="outline"
                                    disabled={isGeneratingWorksheet}
                                    onClick={() => {
                                        setIsGeneratingWorksheet(true);
                                        router.post(
                                            EducationalVideoController.generateWorksheet(
                                                video.id,
                                            ).url,
                                            {},
                                            {
                                                onFinish: () =>
                                                    setIsGeneratingWorksheet(
                                                        false,
                                                    ),
                                            },
                                        );
                                    }}
                                >
                                    <ClipboardList />
                                    {isGeneratingWorksheet
                                        ? 'Generating…'
                                        : 'Generate worksheet'}
                                </Button>
                            )}

                            <a
                                href={video.videoUrl}
                                download
                                className={buttonVariants({
                                    variant: 'outline',
                                })}
                            >
                                <Download />
                                Download
                            </a>
                        </div>
                    )}
                </div>

                <div
                    className={cn(
                        'gap-6',
                        hasOutline && 'grid lg:grid-cols-[1fr_18rem]',
                    )}
                >
                    <div className="space-y-4">
                        {video.status === 'failed' && (
                            <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
                                <AlertCircle className="size-5 shrink-0" />
                                <p className="flex-1">{video.error}</p>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="shrink-0"
                                    onClick={() =>
                                        router.post(
                                            EducationalVideoController.retry(
                                                video.id,
                                            ).url,
                                        )
                                    }
                                >
                                    <RotateCcw className="size-4" />
                                    Retry
                                </Button>
                            </div>
                        )}

                        {video.status === 'completed' && video.videoUrl ? (
                            <div className="overflow-hidden rounded-3xl border border-violet-100 bg-white/70 p-3 shadow-sm dark:border-white/10 dark:bg-white/5">
                                <video
                                    controls
                                    className="w-full rounded-2xl"
                                    src={video.videoUrl}
                                />
                            </div>
                        ) : isAwaitingReview ? (
                            <div className="rounded-3xl border border-violet-100 bg-white/70 p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
                                <StoryboardReview
                                    slides={video.slides}
                                    confirmUrl={
                                        EducationalVideoController.confirmStoryboard(
                                            video.id,
                                        ).url
                                    }
                                    errors={errors}
                                    scenePreviews={video.scenePreviews}
                                />
                            </div>
                        ) : video.status !== 'failed' ? (
                            <div className="rounded-3xl border border-violet-100 bg-white/70 p-8 shadow-sm dark:border-white/10 dark:bg-white/5">
                                <StageProgress status={video.status} />
                                {video.progress && (
                                    <p className="mt-6 text-sm text-muted-foreground">
                                        {video.progress}
                                    </p>
                                )}
                            </div>
                        ) : null}
                    </div>

                    {hasOutline && (
                        <aside className="rounded-3xl border border-violet-100 bg-white/70 p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
                            <p className="font-display mb-3 text-sm font-bold text-violet-950 dark:text-white">
                                Storyboard outline
                            </p>
                            <ol className="space-y-2.5">
                                {video.slides.map((slide, index) => (
                                    <li
                                        key={index}
                                        className="flex gap-2 text-sm"
                                    >
                                        <span className="text-muted-foreground">
                                            {index + 1}.
                                        </span>
                                        <span className="text-violet-900 dark:text-violet-100">
                                            {slide.heading}
                                        </span>
                                    </li>
                                ))}
                            </ol>
                        </aside>
                    )}
                </div>
            </div>
        </>
    );
}
