<?php

namespace App\Actions\EducationalVideo;

use App\Models\EducationalVideo;
use Illuminate\Support\Facades\Process;
use Illuminate\Support\Facades\Storage;
use RuntimeException;

class ComputeSlideTimingsAction
{
    private const FPS = 30;

    private const SLIDE_PADDING_IN_SECONDS = 1;

    private const MINIMUM_SLIDE_DURATION_IN_SECONDS = 3;

    /**
     * Compute each main-video slide's start/end second offsets, replicating the duration
     * formula Remotion's own `calculateMetadata.ts` uses, so the frontend player knows exactly
     * when to pause for the interactive checkpoint. Reads narrated audio durations via `ffprobe`
     * rather than the Remotion side, since `calculateMetadata` also runs inside Remotion Studio's
     * browser preview, where it has no filesystem access to write a sidecar file back out.
     *
     * @return array<int, array{index: int, startSeconds: float, endSeconds: float}>
     */
    public function handle(EducationalVideo $video): array
    {
        $startSeconds = 0.0;
        $timings = [];

        foreach ($video->audio_manifest as $index => $slide) {
            $durationInSeconds = max(
                $this->audioDurationInSeconds(Storage::disk('local')->path($slide['audioPath'])) + self::SLIDE_PADDING_IN_SECONDS,
                self::MINIMUM_SLIDE_DURATION_IN_SECONDS,
            );

            $endSeconds = $startSeconds + (ceil($durationInSeconds * self::FPS) / self::FPS);

            $timings[] = [
                'index' => $index,
                'startSeconds' => round($startSeconds, 3),
                'endSeconds' => round($endSeconds, 3),
            ];

            $startSeconds = $endSeconds;
        }

        return $timings;
    }

    private function audioDurationInSeconds(string $absolutePath): float
    {
        $result = Process::run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', $absolutePath]);

        if ($result->failed()) {
            throw new RuntimeException("ffprobe failed: {$result->errorOutput()}");
        }

        return (float) trim($result->output());
    }
}
