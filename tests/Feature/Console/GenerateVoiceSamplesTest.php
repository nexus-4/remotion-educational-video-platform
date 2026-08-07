<?php

namespace Tests\Feature\Console;

use App\Enums\VoiceType;
use Illuminate\Support\Facades\Storage;
use Laravel\Ai\Audio;
use Tests\TestCase;

class GenerateVoiceSamplesTest extends TestCase
{
    public function test_it_generates_a_sample_clip_for_every_voice()
    {
        Storage::fake('public');
        Audio::fake();

        $this->artisan('educational-videos:generate-voice-samples')->assertSuccessful();

        foreach (VoiceType::cases() as $voice) {
            Storage::disk('public')->assertExists("voice-samples/{$voice->value}.mp3");
        }
    }
}
