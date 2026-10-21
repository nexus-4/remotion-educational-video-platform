<?php

namespace App\Console\Commands;

use App\Enums\IllustrationStyle;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Laravel\Ai\Enums\Lab;
use Laravel\Ai\Image;
use Throwable;

#[Signature('educational-videos:generate-illustration-style-previews')]
#[Description('Render one reference illustration per illustration style, used to preview styles in the create form')]
class GenerateIllustrationStylePreviews extends Command
{
    private const SUBJECT = 'A student reading a book at a desk';

    /**
     * Execute the console command.
     */
    public function handle(): void
    {
        foreach (IllustrationStyle::cases() as $style) {
            $prompt = self::SUBJECT.' '.$style->stylePrompt();

            try {
                $path = Image::of($prompt)
                    ->landscape()
                    ->quality('low')
                    ->generate(provider: [Lab::OpenAI, Lab::Gemini])
                    ->storeAs('illustration-style-previews', "{$style->value}.png", 'public');

                $this->info("Generated preview for [{$style->value}] -> {$path}");
            } catch (Throwable $e) {
                $this->error("Failed to generate preview for [{$style->value}]: {$e->getMessage()}");
            }
        }
    }
}
