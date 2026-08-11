<?php

namespace App\Actions\EducationalVideo;

use App\Actions\EducationalVideo\Concerns\CatchesChainFailures;
use App\Enums\VideoStatus;
use App\Jobs\EducationalVideo\BuildRenderManifestJob;
use App\Jobs\EducationalVideo\GenerateStoryboardJob;
use App\Jobs\EducationalVideo\IllustrateSlidesJob;
use App\Jobs\EducationalVideo\NarrateSlidesJob;
use App\Jobs\EducationalVideo\RenderEducationalVideoJob;
use App\Models\EducationalVideo;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Bus;

class RetryVideoGenerationAction
{
    use CatchesChainFailures;

    /**
     * Re-dispatch only whatever stages haven't already succeeded, so a failure late in the
     * pipeline (e.g. rendering) doesn't waste the narration/illustration work that already
     * completed.
     *
     * The status is flipped synchronously here, matching whichever stage is resumed, rather
     * than waiting for that job to be picked up by a queue worker — otherwise the video still
     * looks `Failed` until then, and a repeated retry request would slip past the controller's
     * guard and dispatch a second, duplicate chain.
     */
    public function handle(EducationalVideo $video): void
    {
        [$status, $jobs] = $this->resumePoint($video);

        $video->update(['status' => $status, 'error' => null]);

        Bus::chain($jobs)->catch($this->catchChainFailure($video))->dispatch();
    }

    /**
     * @return array{0: VideoStatus, 1: array<int, ShouldQueue>}
     */
    private function resumePoint(EducationalVideo $video): array
    {
        if ($video->storyboard === null) {
            return [VideoStatus::GeneratingStoryboard, [
                new GenerateStoryboardJob($video),
            ]];
        }

        if ($video->audio_manifest === null) {
            return [VideoStatus::GeneratingAudio, [
                new NarrateSlidesJob($video),
                new IllustrateSlidesJob($video),
                new BuildRenderManifestJob($video),
                new RenderEducationalVideoJob($video),
            ]];
        }

        $illustrationRan = array_key_exists('imagePath', $video->audio_manifest[0] ?? []);

        if (! $illustrationRan) {
            return [VideoStatus::GeneratingAudio, [
                new IllustrateSlidesJob($video),
                new BuildRenderManifestJob($video),
                new RenderEducationalVideoJob($video),
            ]];
        }

        return [VideoStatus::Rendering, [
            new BuildRenderManifestJob($video),
            new RenderEducationalVideoJob($video),
        ]];
    }
}
