import { Head, usePoll } from '@inertiajs/react';
import {
    AlertCircle,
    Clapperboard,
    Download,
    Mic,
    PenLine,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useEffect } from 'react';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type EducationalVideoStatus =
    | 'pending'
    | 'generating_storyboard'
    | 'generating_audio'
    | 'rendering'
    | 'completed'
    | 'failed';

type SlideOutlineItem = {
    type: string;
    heading: string;
};

type PageProps = {
    video: {
        id: number;
        title: string | null;
        status: EducationalVideoStatus;
        statusLabel: string;
        progress: string | null;
        error: string | null;
        videoUrl: string | null;
        slides: SlideOutlineItem[];
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
    const isTerminal =
        video.status === 'completed' || video.status === 'failed';

    const { stop } = usePoll(3000, {}, { autoStart: !isTerminal });

    useEffect(() => {
        if (isTerminal) {
            stop();
        }
    }, [isTerminal, stop]);

    const hasOutline = video.slides.length > 0;

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
                        <a
                            href={video.videoUrl}
                            download
                            className={buttonVariants({ variant: 'outline' })}
                        >
                            <Download />
                            Download
                        </a>
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
                                <p>{video.error}</p>
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
