<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('educational_videos', function (Blueprint $table) {
            $table->boolean('interactive')->default(false)->after('content_focus');
            $table->json('interactive_checkpoint')->nullable()->after('worksheet');
            $table->json('slide_timings')->nullable()->after('interactive_checkpoint');
            $table->string('remediation_video_path')->nullable()->after('video_path');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('educational_videos', function (Blueprint $table) {
            $table->dropColumn(['interactive', 'interactive_checkpoint', 'slide_timings', 'remediation_video_path']);
        });
    }
};
