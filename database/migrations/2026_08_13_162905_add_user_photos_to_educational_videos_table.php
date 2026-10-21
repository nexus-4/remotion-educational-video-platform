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
            $table->json('user_photos')->nullable()->after('topic');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('educational_videos', function (Blueprint $table) {
            $table->dropColumn('user_photos');
        });
    }
};
