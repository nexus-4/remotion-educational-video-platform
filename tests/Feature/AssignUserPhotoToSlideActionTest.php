<?php

namespace Tests\Feature;

use App\Actions\EducationalVideo\AssignUserPhotoToSlideAction;
use App\Models\EducationalVideo;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class AssignUserPhotoToSlideActionTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_copies_the_photo_into_the_slides_image_slot()
    {
        Storage::fake('local');
        Storage::fake('public');

        $video = EducationalVideo::factory()->create();

        Storage::disk('public')->put('educational-videos/user-photos/classroom.jpg', 'fake-photo-bytes');

        $path = (new AssignUserPhotoToSlideAction)->handle($video, 'educational-videos/user-photos/classroom.jpg', 2);

        $this->assertSame("educational-videos/{$video->id}/images/slide-2.png", $path);
        Storage::disk('local')->assertExists($path);
        $this->assertSame('fake-photo-bytes', Storage::disk('local')->get($path));
    }
}
