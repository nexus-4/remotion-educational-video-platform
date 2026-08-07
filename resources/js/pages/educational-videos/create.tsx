import { Form, Head } from '@inertiajs/react';
import { useState } from 'react';
import EducationalVideoController from '@/actions/App/Http/Controllers/EducationalVideoController';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { create, index } from '@/routes/educational-videos';

type Option = {
    value: string;
    label: string;
};

type PageProps = {
    voices: Option[];
    templates: Option[];
    formats: Option[];
};

function EnumSelect({
    id,
    label,
    options,
    value,
    onChange,
    error,
}: {
    id: string;
    label: string;
    options: Option[];
    value: string;
    onChange: (value: string) => void;
    error?: string;
}) {
    return (
        <div className="grid gap-2">
            <Label htmlFor={id}>{label}</Label>

            <input type="hidden" name={id} value={value} />

            <Select value={value} onValueChange={onChange}>
                <SelectTrigger id={id} className="w-full">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {options.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                            {option.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <InputError message={error} />
        </div>
    );
}

export default function CreateEducationalVideo({
    voices,
    templates,
    formats,
}: PageProps) {
    const [voice, setVoice] = useState(voices[0]?.value ?? '');
    const [template, setTemplate] = useState(templates[0]?.value ?? '');
    const [format, setFormat] = useState(formats[0]?.value ?? '');

    return (
        <>
            <Head title="Create an educational video" />

            <h1 className="sr-only">Create an educational video</h1>

            <div className="max-w-2xl space-y-6">
                <Heading
                    title="Create an educational video"
                    description="Upload a PDF and we'll turn it into a narrated, animated video for students."
                />

                <Form
                    {...EducationalVideoController.store.form()}
                    className="space-y-6"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="title">Title (optional)</Label>
                                <Input
                                    id="title"
                                    name="title"
                                    placeholder="e.g. The Water Cycle"
                                />
                                <InputError message={errors.title} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="pdf">Source PDF</Label>
                                <Input
                                    id="pdf"
                                    type="file"
                                    name="pdf"
                                    accept="application/pdf"
                                    required
                                />
                                <InputError message={errors.pdf} />
                            </div>

                            <EnumSelect
                                id="voice"
                                label="Narrator voice"
                                options={voices}
                                value={voice}
                                onChange={setVoice}
                                error={errors.voice}
                            />

                            <EnumSelect
                                id="template"
                                label="Template"
                                options={templates}
                                value={template}
                                onChange={setTemplate}
                                error={errors.template}
                            />

                            <EnumSelect
                                id="format"
                                label="Video format"
                                options={formats}
                                value={format}
                                onChange={setFormat}
                                error={errors.format}
                            />

                            <div className="flex items-center gap-4">
                                <Button
                                    disabled={processing}
                                    data-test="generate-video-button"
                                >
                                    Generate video
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </div>
        </>
    );
}

CreateEducationalVideo.layout = {
    breadcrumbs: [
        {
            title: 'Videos',
            href: index(),
        },
        {
            title: 'Create an educational video',
            href: create(),
        },
    ],
};
