<?php

namespace App\Http\Requests;

use App\Enums\SlideType;
use App\Models\EducationalVideo;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class ConfirmStoryboardRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        /** @var EducationalVideo $video */
        $video = $this->route('video');

        return [
            'slides' => ['required', 'array', 'min:'.$video->format->minimumSlides(), 'max:'.$video->format->maximumSlides()],
            'slides.*.originalIndex' => ['required', 'integer', 'min:0', 'max:'.(count($video->storyboard['slides'] ?? []) - 1)],
            'slides.*.type' => ['required', Rule::enum(SlideType::class)],
            'slides.*.heading' => ['required', 'string', 'max:255'],
            'slides.*.narration' => ['required', 'string'],
            'slides.*.bullets' => ['nullable', 'array'],
            'slides.*.bullets.*' => ['string'],
            'slides.*.formula' => ['nullable', 'string', 'required_if:slides.*.type,formula'],
            'slides.*.imagePrompt' => ['nullable', 'string'],
            'slides.*.leftLabel' => ['nullable', 'string', 'required_if:slides.*.type,comparison'],
            'slides.*.leftItems' => ['nullable', 'array', 'min:1', 'max:4', 'required_if:slides.*.type,comparison'],
            'slides.*.leftItems.*' => ['string'],
            'slides.*.rightLabel' => ['nullable', 'string', 'required_if:slides.*.type,comparison'],
            'slides.*.rightItems' => ['nullable', 'array', 'min:1', 'max:4', 'required_if:slides.*.type,comparison'],
            'slides.*.rightItems.*' => ['string'],
            'slides.*.steps' => ['nullable', 'array', 'min:2', 'max:6', 'required_if:slides.*.type,timeline'],
            'slides.*.steps.*' => ['string'],
            'slides.*.statValue' => ['nullable', 'string', 'required_if:slides.*.type,big_stat'],
            'slides.*.statLabel' => ['nullable', 'string', 'required_if:slides.*.type,big_stat'],
            'slides.*.term' => ['nullable', 'string', 'required_if:slides.*.type,definition'],
            'slides.*.definition' => ['nullable', 'string', 'required_if:slides.*.type,definition'],
        ];
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            $slides = $this->input('slides', []);

            if ($slides === []) {
                return;
            }

            if (($slides[0]['type'] ?? null) !== SlideType::Intro->value) {
                $validator->errors()->add('slides.0.type', 'The first slide must be the introduction.');
            }

            if ((end($slides)['type'] ?? null) !== SlideType::Outro->value) {
                $validator->errors()->add('slides.'.(count($slides) - 1).'.type', 'The last slide must be the ending.');
            }
        });
    }
}
