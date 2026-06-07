<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('lessons', function (Blueprint $table) {
            $table->renameColumn('audio_url', 'audio_path');
        });

        Schema::table('lesson_clips', function (Blueprint $table) {
            $table->renameColumn('audio_url', 'audio_path');
        });
    }

    public function down(): void
    {
        Schema::table('lessons', function (Blueprint $table) {
            $table->renameColumn('audio_path', 'audio_url');
        });

        Schema::table('lesson_clips', function (Blueprint $table) {
            $table->renameColumn('audio_path', 'audio_url');
        });
    }
};
