import { Head, usePoll } from '@inertiajs/react';
import { Download } from 'lucide-react';
import { useEffect } from 'react';
import Heading from '@/components/heading';
import { buttonVariants } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { index } from '@/routes/educational-videos';

type EducationalVideoStatus =
    | 'pending'
    | 'generating_storyboard'
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
    };
};

export default function ShowEducationalVideo({ video }: PageProps) {
    const isTerminal =
        video.status === 'completed' || video.status === 'failed';

    const { stop } = usePoll(3000, {}, { autoStart: !isTerminal });

    useEffect(() => {
        if (isTerminal) {
            stop();
        }
    }, [isTerminal, stop]);

    return (
        <>
            <Head title={video.title ?? 'Generating video'} />

            <div className="max-w-3xl space-y-6">
                <div className="flex items-start justify-between gap-4">
                    <Heading
                        title={video.title ?? 'Your video'}
                        description={video.statusLabel}
                    />

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

                {video.status === 'failed' && (
                    <p className="text-sm text-red-600 dark:text-red-400">
                        {video.error}
                    </p>
                )}

                {video.status === 'completed' && video.videoUrl ? (
                    <video
                        controls
                        className="w-full rounded-lg border"
                        src={video.videoUrl}
                    />
                ) : (
                    <div className="flex items-center gap-3 rounded-lg border p-6 text-sm text-muted-foreground">
                        <Spinner />
                        {video.progress ?? `${video.statusLabel}…`}
                    </div>
                )}
            </div>
        </>
    );
}

ShowEducationalVideo.layout = {
    breadcrumbs: [
        {
            title: 'Videos',
            href: index(),
        },
    ],
};
