<?php

namespace App\Models;

use App\Enums\AnimationStyle;
use App\Enums\IllustrationStyle;
use App\Enums\VideoFormat;
use App\Enums\VideoStatus;
use App\Enums\VideoTemplate;
use App\Enums\VoiceType;
use Database\Factories\EducationalVideoFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string|null $title
 * @property string|null $source_pdf_path
 * @property string|null $topic
 * @property array<int, string>|null $user_photos
 * @property string|null $logo_path
 * @property VoiceType $voice
 * @property VideoTemplate $template
 * @property VideoFormat $format
 * @property IllustrationStyle $illustration_style
 * @property AnimationStyle $animation_style
 * @property string|null $content_focus
 * @property bool $interactive
 * @property VideoStatus $status
 * @property string|null $progress
 * @property array<string, mixed>|null $storyboard
 * @property array<int, array<string, mixed>>|null $audio_manifest
 * @property array<int, array<string, mixed>>|null $worksheet
 * @property array<string, mixed>|null $interactive_checkpoint
 * @property array<int, array<string, mixed>>|null $slide_timings
 * @property string|null $video_path
 * @property string|null $remediation_video_path
 * @property string|null $thumbnail_path
 * @property string|null $error
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['title', 'source_pdf_path', 'topic', 'user_photos', 'logo_path', 'voice', 'template', 'format', 'illustration_style', 'animation_style', 'content_focus', 'interactive', 'status', 'progress', 'storyboard', 'audio_manifest', 'worksheet', 'interactive_checkpoint', 'slide_timings', 'video_path', 'remediation_video_path', 'thumbnail_path', 'error'])]
class EducationalVideo extends Model
{
    /** @use HasFactory<EducationalVideoFactory> */
    use HasFactory;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'voice' => VoiceType::class,
            'template' => VideoTemplate::class,
            'format' => VideoFormat::class,
            'illustration_style' => IllustrationStyle::class,
            'animation_style' => AnimationStyle::class,
            'status' => VideoStatus::class,
            'interactive' => 'boolean',
            'storyboard' => 'array',
            'audio_manifest' => 'array',
            'worksheet' => 'array',
            'interactive_checkpoint' => 'array',
            'slide_timings' => 'array',
            'user_photos' => 'array',
        ];
    }
}
