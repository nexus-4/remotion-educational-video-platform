<?php

namespace App\Console\Commands;

use App\Enums\VoiceType;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Laravel\Ai\Audio;

#[Signature('educational-videos:generate-voice-samples')]
#[Description('Generate a short sample clip for each narrator voice, used to preview voices in the create form')]
class GenerateVoiceSamples extends Command
{
    private const SAMPLE_TEXT = "Hi! I'll be narrating your educational video today.";

    /**
     * Execute the console command.
     */
    public function handle(): void
    {
        foreach (VoiceType::cases() as $voice) {
            $path = Audio::of(self::SAMPLE_TEXT)
                ->voice($voice->value)
                ->generate()
                ->storeAs('voice-samples', "{$voice->value}.mp3", 'public');

            $this->info("Generated sample for [{$voice->value}] -> {$path}");
        }
    }
}
