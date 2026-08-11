<?php

namespace App\Http\Requests;

use App\Enums\AnimationStyle;
use App\Enums\IllustrationStyle;
use App\Enums\VideoFormat;
use App\Enums\VideoTemplate;
use App\Enums\VoiceType;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreEducationalVideoRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'pdf' => ['required', 'file', 'mimes:pdf', 'max:20480'],
            'title' => ['nullable', 'string', 'max:255'],
            'voice' => ['required', Rule::enum(VoiceType::class)],
            'template' => ['required', Rule::enum(VideoTemplate::class)],
            'format' => ['required', Rule::enum(VideoFormat::class)],
            'illustration_style' => ['required', Rule::enum(IllustrationStyle::class)],
            'animation_style' => ['required', Rule::enum(AnimationStyle::class)],
            'content_focus' => ['nullable', 'string', 'max:500'],
        ];
    }
}
