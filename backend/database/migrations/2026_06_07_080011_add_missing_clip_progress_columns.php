<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('user_clip_progress', function (Blueprint $table) {
            $table->unsignedInteger('attempt_count')->default(1)->after('accuracy');
            $table->text('transcribed_text')->nullable()->after('transcript_input');
        });
    }

    public function down(): void
    {
        Schema::table('user_clip_progress', function (Blueprint $table) {
            $table->dropColumn(['attempt_count', 'transcribed_text']);
        });
    }
};
