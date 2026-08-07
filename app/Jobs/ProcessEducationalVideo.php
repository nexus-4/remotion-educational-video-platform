<?php

namespace App\Jobs;

use App\Actions\GenerateEducationalVideo;
use App\Models\EducationalVideo;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class ProcessEducationalVideo implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $timeout = 900;

    public function __construct(public EducationalVideo $video) {}

    public function handle(GenerateEducationalVideo $action): void
    {
        $action->handle($this->video);
    }
}
