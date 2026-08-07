<?php

namespace Database\Factories;

use App\Enums\IllustrationStyle;
use App\Enums\VideoFormat;
use App\Enums\VideoStatus;
use App\Enums\VideoTemplate;
use App\Enums\VoiceType;
use App\Models\EducationalVideo;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<EducationalVideo>
 */
class EducationalVideoFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'title' => fake()->sentence(4),
            'source_pdf_path' => 'educational-videos/pdfs/'.fake()->uuid().'.pdf',
            'voice' => fake()->randomElement(VoiceType::cases()),
            'template' => fake()->randomElement(VideoTemplate::cases()),
            'format' => fake()->randomElement(VideoFormat::cases()),
            'illustration_style' => fake()->randomElement(IllustrationStyle::cases()),
            'status' => VideoStatus::Pending,
        ];
    }

    public function completed(): static
    {
        return $this->state(fn (): array => [
            'status' => VideoStatus::Completed,
            'storyboard' => [
                'title' => fake()->sentence(4),
                'summary' => fake()->sentence(),
                'slides' => [],
            ],
            'audio_manifest' => [],
            'video_path' => 'educational-videos/'.fake()->uuid().'.mp4',
        ]);
    }

    public function failed(): static
    {
        return $this->state(fn (): array => [
            'status' => VideoStatus::Failed,
            'error' => fake()->sentence(),
        ]);
    }
}
