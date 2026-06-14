<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_external_lesson_segments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('lesson_id')->constrained('listening_external_lessons')->cascadeOnDelete();
            $table->unsignedInteger('segment_index');
            $table->text('user_input');
            $table->unsignedInteger('correct_words')->default(0);
            $table->unsignedInteger('wrong_words')->default(0);
            $table->unsignedInteger('missing_words')->default(0);
            $table->unsignedInteger('extra_words')->default(0);
            $table->decimal('accuracy', 5, 2)->default(0.00);
            $table->unsignedInteger('time_spent_ms')->default(0);
            $table->timestamp('created_at')->nullable();

            $table->index(['user_id', 'lesson_id']);
            $table->index(['lesson_id', 'segment_index']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_external_lesson_segments');
    }
};
