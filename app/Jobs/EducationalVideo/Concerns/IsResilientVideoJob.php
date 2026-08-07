<?php

namespace App\Jobs\EducationalVideo\Concerns;

use Illuminate\Queue\Attributes\Backoff;
use Illuminate\Queue\Attributes\DeleteWhenMissingModels;
use Illuminate\Queue\Attributes\Timeout;
use Illuminate\Queue\Attributes\Tries;
use Illuminate\Queue\Middleware\WithoutOverlapping;

#[Timeout(900)]
#[Tries(3)]
#[Backoff([10, 30, 90])]
#[DeleteWhenMissingModels]
trait IsResilientVideoJob
{
    /**
     * @return array<int, object>
     */
    public function middleware(): array
    {
        return [
            (new WithoutOverlapping((string) $this->video->id))->releaseAfter(10),
        ];
    }
}
