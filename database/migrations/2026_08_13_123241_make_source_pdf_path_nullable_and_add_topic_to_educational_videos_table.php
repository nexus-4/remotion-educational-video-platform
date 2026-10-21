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
            $table->string('source_pdf_path')->nullable()->change();
            $table->text('topic')->nullable()->after('source_pdf_path');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('educational_videos', function (Blueprint $table) {
            $table->dropColumn('topic');
            $table->string('source_pdf_path')->nullable(false)->change();
        });
    }
};
