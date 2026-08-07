<?php

namespace App\Models;

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
 * @property string $source_pdf_path
 * @property VoiceType $voice
 * @property VideoTemplate $template
 * @property VideoFormat $format
 * @property VideoStatus $status
 * @property string|null $progress
 * @property array<string, mixed>|null $storyboard
 * @property array<int, array<string, mixed>>|null $audio_manifest
 * @property string|null $video_path
 * @property string|null $error
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['title', 'source_pdf_path', 'voice', 'template', 'format', 'status', 'progress', 'storyboard', 'audio_manifest', 'video_path', 'error'])]
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
            'status' => VideoStatus::class,
            'storyboard' => 'array',
            'audio_manifest' => 'array',
        ];
    }
}
