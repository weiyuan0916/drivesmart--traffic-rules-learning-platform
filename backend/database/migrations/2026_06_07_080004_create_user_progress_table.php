<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_progress', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')
                ->constrained()
                ->cascadeOnDelete();
            $table->foreignId('lesson_id')
                ->constrained()
                ->restrictOnDelete();    // Prevent lesson deletion if users have progress
            $table->decimal('accuracy', 5, 2)->nullable();   // 0.00 - 100.00
            $table->unsignedInteger('xp_earned')->default(0);
            $table->unsignedInteger('time_seconds')->default(0);
            $table->unsignedInteger('attempt_count')->default(1);
            $table->decimal('best_score', 5, 2)->nullable(); // best accuracy achieved
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            // Unique: one best-score record per user per lesson
            $table->unique(['user_id', 'lesson_id']);

            // Dashboard: user's progress sorted by completion
            $table->index(['user_id', 'completed_at']);

            // Filter by lesson (history view)
            $table->index('lesson_id');
            $table->index('user_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_progress');
    }
};
