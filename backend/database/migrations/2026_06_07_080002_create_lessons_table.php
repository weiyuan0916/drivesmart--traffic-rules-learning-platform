<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lessons', function (Blueprint $table) {
            $table->id();
            $table->foreignId('topic_id')
                ->constrained()
                ->cascadeOnDelete();
            $table->string('slug')->nullable();
            $table->string('name');
            $table->string('audio_url')->nullable();
            $table->unsignedInteger('duration')->nullable(); // seconds
            $table->string('vocab_level', 20)->nullable();   // beginner, intermediate, advanced
            $table->unsignedInteger('order_index')->default(0);
            $table->timestamps();
            $table->softDeletes();

            $table->index(['topic_id', 'order_index']);
            $table->index('vocab_level');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lessons');
    }
};
