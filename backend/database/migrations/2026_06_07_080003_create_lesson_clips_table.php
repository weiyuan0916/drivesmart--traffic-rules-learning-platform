<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lesson_clips', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lesson_id')
                ->constrained()
                ->cascadeOnDelete();
            $table->text('transcript');                   // The expected transcript for dictation
            $table->string('audio_url')->nullable();     // R2 URL after T-A-006
            $table->unsignedInteger('duration')->nullable(); // seconds
            $table->unsignedInteger('order_index')->default(0);
            $table->timestamps();
            $table->softDeletes();

            $table->index(['lesson_id', 'order_index']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lesson_clips');
    }
};
