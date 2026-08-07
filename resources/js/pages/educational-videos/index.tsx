import { Head, Link } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { create, index, show } from '@/routes/educational-videos';

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
    createdAt: string | null;
};

type PageProps = {
    videos: VideoListItem[];
};

const STATUS_BADGE_VARIANT: Record<
    EducationalVideoStatus,
    'default' | 'secondary' | 'destructive' | 'outline'
> = {
    pending: 'outline',
    generating_storyboard: 'secondary',
    generating_audio: 'secondary',
    rendering: 'secondary',
    completed: 'default',
    failed: 'destructive',
};

export default function IndexEducationalVideos({ videos }: PageProps) {
    return (
        <>
            <Head title="Videos" />

            <div className="max-w-3xl space-y-6">
                <div className="flex items-center justify-between gap-4">
                    <Heading
                        title="Videos"
                        description="Educational videos generated from your PDFs."
                    />

                    <Link href={create()} className={buttonVariants()}>
                        <Plus />
                        New video
                    </Link>
                </div>

                {videos.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                        No videos yet. Generate your first one.
                    </p>
                ) : (
                    <ul className="divide-y rounded-lg border">
                        {videos.map((video) => (
                            <li key={video.id}>
                                <Link
                                    href={show(video.id)}
                                    className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-accent"
                                >
                                    <div className="flex flex-col">
                                        <span className="font-medium">
                                            {video.title}
                                        </span>
                                        {video.createdAt && (
                                            <span className="text-sm text-muted-foreground">
                                                {new Date(
                                                    video.createdAt,
                                                ).toLocaleString()}
                                            </span>
                                        )}
                                    </div>
                                    <Badge
                                        variant={
                                            STATUS_BADGE_VARIANT[video.status]
                                        }
                                    >
                                        {video.statusLabel}
                                    </Badge>
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </>
    );
}

IndexEducationalVideos.layout = {
    breadcrumbs: [
        {
            title: 'Videos',
            href: index(),
        },
    ],
};
