import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

export type InteractiveCheckpoint = {
    afterSlideIndex: number;
    question: string;
    options: string[];
    correctOptionIndex: number;
};

export type SlideTiming = {
    index: number;
    startSeconds: number;
    endSeconds: number;
};

type InteractiveVideoPlayerProps = {
    videoUrl: string;
    remediationVideoUrl: string;
    checkpoint: InteractiveCheckpoint;
    slideTimings: SlideTiming[];
};

/**
 * Plays the main video normally, pauses once at the interactive checkpoint to ask a
 * comprehension question, then either resumes the same video in place (correct answer — no
 * extra asset ever loads) or plays the short remediation clip before resuming (wrong answer).
 *
 * The main video and the remediation clip are two separate, always-distinct `<video>`
 * elements — only the remediation one is ever mounted/unmounted. The main video element is
 * never reloaded or re-seeked to resume; it's simply hidden while paused, and shown again
 * (still sitting at the exact frame it paused on) once the remediation clip finishes.
 */
export function InteractiveVideoPlayer({
    videoUrl,
    remediationVideoUrl,
    checkpoint,
    slideTimings,
}: InteractiveVideoPlayerProps) {
    const mainVideoRef = useRef<HTMLVideoElement>(null);
    const checkpointHandledRef = useRef(false);

    const [showQuestion, setShowQuestion] = useState(false);
    const [showRemediation, setShowRemediation] = useState(false);

    const checkpointEndSeconds =
        slideTimings.find(
            (timing) => timing.index === checkpoint.afterSlideIndex,
        )?.endSeconds ?? 0;

    const handleTimeUpdate = () => {
        const el = mainVideoRef.current;

        if (!el || checkpointHandledRef.current) {
            return;
        }

        if (el.currentTime >= checkpointEndSeconds) {
            checkpointHandledRef.current = true;
            el.pause();
            setShowQuestion(true);
        }
    };

    const handleAnswer = (optionIndex: number) => {
        setShowQuestion(false);

        if (optionIndex === checkpoint.correctOptionIndex) {
            void mainVideoRef.current?.play();

            return;
        }

        setShowRemediation(true);
    };

    const handleRemediationEnded = () => {
        setShowRemediation(false);
        void mainVideoRef.current?.play();
    };

    return (
        <>
            <div className="overflow-hidden rounded-3xl border border-violet-100 bg-white/70 p-3 shadow-sm dark:border-white/10 dark:bg-white/5">
                <video
                    ref={mainVideoRef}
                    controls
                    hidden={showRemediation}
                    className="w-full rounded-2xl"
                    src={videoUrl}
                    onTimeUpdate={handleTimeUpdate}
                />

                {showRemediation && (
                    <video
                        controls
                        autoPlay
                        controlsList="nodownload"
                        className="w-full rounded-2xl"
                        src={remediationVideoUrl}
                        onEnded={handleRemediationEnded}
                    />
                )}
            </div>

            <Dialog open={showQuestion} onOpenChange={() => {}}>
                <DialogContent
                    className="[&>button]:hidden"
                    onEscapeKeyDown={(event) => event.preventDefault()}
                    onInteractOutside={(event) => event.preventDefault()}
                >
                    <DialogHeader>
                        <DialogTitle>Quick check</DialogTitle>
                    </DialogHeader>

                    <p className="text-sm text-violet-900 dark:text-violet-100">
                        {checkpoint.question}
                    </p>

                    <div className="grid gap-2">
                        {checkpoint.options.map((option, index) => (
                            <Button
                                key={index}
                                type="button"
                                variant="outline"
                                className="h-auto justify-start px-4 py-3 text-left whitespace-normal"
                                onClick={() => handleAnswer(index)}
                            >
                                {option}
                            </Button>
                        ))}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
