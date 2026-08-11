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
}
