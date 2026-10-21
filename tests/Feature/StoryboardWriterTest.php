<?php

namespace Tests\Feature;

use App\Ai\Agents\StoryboardWriter;
use App\Enums\VideoFormat;
use App\Enums\VideoTemplate;
use Tests\TestCase;

class StoryboardWriterTest extends TestCase
{
    public function test_instructions_include_the_content_focus_line_when_set()
    {
        $writer = new StoryboardWriter(
            template: VideoTemplate::NotebookLm,
            format: VideoFormat::Short,
            contentFocus: 'the causes, not just the timeline',
        );

        $this->assertStringContainsString('the causes, not just the timeline', (string) $writer->instructions());
    }

    public function test_instructions_omit_the_content_focus_line_when_not_set()
    {
        $writer = new StoryboardWriter(
            template: VideoTemplate::NotebookLm,
            format: VideoFormat::Short,
        );

        $this->assertStringNotContainsString('specifically wants this video to focus on', (string) $writer->instructions());
    }

    public function test_instructions_require_document_grounding_by_default()
    {
        $writer = new StoryboardWriter(
            template: VideoTemplate::NotebookLm,
            format: VideoFormat::Short,
        );

        $this->assertStringContainsString('Base every slide strictly on the attached document', (string) $writer->instructions());
        $this->assertStringNotContainsString('There is no source document', (string) $writer->instructions());
    }

    public function test_instructions_require_brazilian_portuguese_for_every_storyboard_field()
    {
        $writer = new StoryboardWriter(
            template: VideoTemplate::StandardLecture,
            format: VideoFormat::Short,
        );

        $instructions = (string) $writer->instructions();

        $this->assertStringContainsString('Brazilian Portuguese (pt-BR)', $instructions);
        $this->assertStringContainsString('Never switch to Spanish', $instructions);
    }

    public function test_instructions_allow_general_knowledge_when_there_is_no_source_document()
    {
        $writer = new StoryboardWriter(
            template: VideoTemplate::NotebookLm,
            format: VideoFormat::Short,
            hasSourceDocument: false,
        );

        $this->assertStringContainsString('There is no source document', (string) $writer->instructions());
        $this->assertStringNotContainsString('Base every slide strictly on the attached document', (string) $writer->instructions());
    }
}
