import { Head, Link } from '@inertiajs/react';
import { AlertCircle, CheckCircle2, Loader2, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { create, show } from '@/routes/educational-videos';

type EducationalVideoStatus =
    | 'pending'
    | 'generating_storyboard'
    | 'generating_audio'
    | 'rendering'
    | 'completed'
    | 'failed';

type VideoListItem = {
    id: number;
    title: string;
    status: EducationalVideoStatus;
    statusLabel: string;
    template: string;
    createdAt: string | null;
};

type PageProps = {
    videos: VideoListItem[];
};

const HEADER_BAND: Record<string, string> = {
    notebook_lm: 'bg-gradient-to-br from-amber-200 via-orange-100 to-rose-100',
    standard_lecture:
        'bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950',
};

function StatusIndicator({ status }: { status: EducationalVideoStatus }) {
    if (status === 'completed') {
        return (
            <span className="flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-emerald-700 shadow-sm">
                <CheckCircle2 className="size-3.5" />
                Ready
            </span>
        );
    }

    if (status === 'failed') {
        return (
            <span className="flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-red-700 shadow-sm">
                <AlertCircle className="size-3.5" />
                Failed
            </span>
        );
    }

    return (
        <span className="flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-violet-700 shadow-sm">
            <Loader2 className="size-3.5 animate-spin" />
            Generating
        </span>
    );
}

export default function IndexEducationalVideos({ videos }: PageProps) {
    return (
        <>
            <Head title="Videos" />

            <div className="space-y-8">
                <div>
                    <h1 className="font-display text-3xl font-extrabold text-violet-950 dark:text-white">
                        Your videos
                    </h1>
                    <p className="mt-1 text-muted-foreground">
                        Educational videos generated from your lesson PDFs.
                    </p>
                </div>

                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    <Link
                        href={create()}
                        className="flex min-h-52 flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-violet-300 bg-violet-50/50 text-violet-700 transition-colors hover:border-violet-500 hover:bg-violet-50 dark:border-violet-500/30 dark:bg-white/5 dark:text-violet-300"
                    >
                        <span className="flex size-12 items-center justify-center rounded-full bg-violet-600 text-white">
                            <Plus className="size-6" />
                        </span>
                        <span className="font-display font-bold">
                            New video
                        </span>
                    </Link>

                    {videos.map((video) => (
                        <Link
                            key={video.id}
                            href={show(video.id)}
                            className="group flex flex-col overflow-hidden rounded-3xl border border-violet-100 bg-white/80 shadow-sm transition-shadow hover:shadow-lg dark:border-white/10 dark:bg-white/5"
                        >
                            <div
                                className={cn(
                                    'flex h-24 items-end p-4',
                                    HEADER_BAND[video.template] ??
                                        HEADER_BAND.standard_lecture,
                                )}
                            >
                                <StatusIndicator status={video.status} />
                            </div>

                            <div className="flex flex-1 flex-col gap-1 p-4">
                                <p className="font-display line-clamp-2 font-bold text-violet-950 dark:text-white">
                                    {video.title}
                                </p>
                                {video.createdAt && (
                                    <p className="text-xs text-muted-foreground">
                                        {new Date(
                                            video.createdAt,
                                        ).toLocaleString()}
                                    </p>
                                )}
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </>
    );
}
