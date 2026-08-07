<?php

namespace App\Actions\EducationalVideo;

use App\Models\EducationalVideo;
use Illuminate\Contracts\Filesystem\FileNotFoundException;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Process;
use Illuminate\Support\Facades\Storage;
use RuntimeException;

class RenderVideoAction
{
    /**
     * Invoke the Remotion CLI to render the composition and store the resulting MP4.
     * @throws FileNotFoundException
     */
    public function handle(EducationalVideo $video): string
    {
        $outputRelativePath = "out/{$video->id}.mp4";

        $command = [
            'npx', 'remotion', 'render', 'EducationalVideo',
            $outputRelativePath,
            '--props='.json_encode(['videoId' => (string) $video->id]),
        ];

        Log::info("[EducationalVideo #{$video->id}] Starting Remotion render", ['command' => implode(' ', $command)]);

        $startedAt = microtime(true);

        $result = Process::path(config('services.remotion.path'))
            ->timeout((int) config('services.remotion.render_timeout'))
            ->run($command);

        $durationInSeconds = round(microtime(true) - $startedAt, 1);

        if ($result->failed()) {
            Log::error("[EducationalVideo #{$video->id}] Remotion render failed", [
                'exit_code' => $result->exitCode(),
                'output' => $result->output(),
                'error_output' => $result->errorOutput(),
            ]);

            throw new RuntimeException("Remotion render failed: {$result->errorOutput()}");
        }

        Log::info("[EducationalVideo #{$video->id}] Remotion render finished", ['duration_seconds' => $durationInSeconds]);

        $video->update(['progress' => 'Saving the rendered video…']);

        $renderedAbsolutePath = config('services.remotion.path')."/{$outputRelativePath}";
        $storedPath = "educational-videos/{$video->id}.mp4";

        Storage::disk('public')->put($storedPath, File::get($renderedAbsolutePath));

        return $storedPath;
    }
}
