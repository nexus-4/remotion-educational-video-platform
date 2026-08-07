import { Pause, Play, Volume2 } from 'lucide-react';
import { useRef, useState } from 'react';
import { cn } from '@/lib/utils';

type VoiceCardProps = {
    value: string;
    label: string;
    sampleUrl: string | null;
    selected: boolean;
    onSelect: () => void;
};

const AVATAR_COLORS: Record<string, string> = {
    alloy: 'from-slate-400 to-slate-600',
    echo: 'from-sky-400 to-sky-600',
    fable: 'from-fuchsia-400 to-fuchsia-600',
    nova: 'from-rose-400 to-rose-600',
    onyx: 'from-zinc-600 to-zinc-800',
    shimmer: 'from-amber-300 to-amber-500',
};

/** A voice option card with a personality label and, if a sample exists, a play button. */
export function VoiceCard({
    value,
    label,
    sampleUrl,
    selected,
    onSelect,
}: VoiceCardProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const togglePlayback = (event: React.MouseEvent) => {
        event.stopPropagation();

        if (!audioRef.current) {
            return;
        }

        if (isPlaying) {
            audioRef.current.pause();

            return;
        }

        audioRef.current.currentTime = 0;
        audioRef.current.play();
    };

    return (
        <button
            type="button"
            onClick={onSelect}
            className={cn(
                'flex items-center gap-3 rounded-2xl border-2 p-3 text-left transition-all',
                selected
                    ? 'border-violet-500 bg-violet-50/60 shadow-md dark:bg-violet-500/10'
                    : 'border-transparent bg-white/70 hover:border-violet-200 dark:bg-white/5 dark:hover:border-violet-500/30',
            )}
        >
            <span
                className={cn(
                    'flex size-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-white',
                    AVATAR_COLORS[value] ?? 'from-violet-400 to-violet-600',
                )}
            >
                <Volume2 className="size-5" />
            </span>

            <span className="flex-1 text-sm font-semibold text-violet-950 dark:text-white">
                {label}
            </span>

            {sampleUrl && (
                <span
                    role="button"
                    tabIndex={0}
                    onClick={togglePlayback}
                    className="flex size-8 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-700 hover:bg-violet-200 dark:bg-white/10 dark:text-violet-200"
                >
                    {isPlaying ? (
                        <Pause className="size-4" />
                    ) : (
                        <Play className="size-4" />
                    )}
                    <audio
                        ref={audioRef}
                        src={sampleUrl}
                        onPlay={() => setIsPlaying(true)}
                        onPause={() => setIsPlaying(false)}
                        onEnded={() => setIsPlaying(false)}
                    />
                </span>
            )}
        </button>
    );
}
