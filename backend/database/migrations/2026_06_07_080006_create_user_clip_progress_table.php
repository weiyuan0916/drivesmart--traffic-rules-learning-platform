<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_clip_progress', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')
                ->constrained()
                ->cascadeOnDelete();
            $table->foreignId('clip_id')
                ->constrained('lesson_clips')
                ->cascadeOnDelete();
            $table->text('transcript_input')->nullable();   // What the user typed
            $table->decimal('accuracy', 5, 2)->nullable();
            $table->decimal('speaking_score', 5, 2)->nullable(); // Reserved for T-A-007
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            // Filter by user
            $table->index('user_id');
            // Filter by clip
            $table->index('clip_id');
            // Completed clips for user history
            $table->index(['user_id', 'completed_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_clip_progress');
    }
};
