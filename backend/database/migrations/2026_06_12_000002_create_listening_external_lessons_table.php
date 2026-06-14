<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('listening_external_lessons', function (Blueprint $table) {
            $table->id();
            $table->foreignId('source_id')->constrained('listening_sources')->cascadeOnDelete();
            $table->string('title');
            $table->string('slug');
            $table->string('source_url');
            $table->string('thumbnail_url')->nullable();
            $table->string('level', 20)->nullable(); // beginner, intermediate, advanced
            $table->unsignedInteger('duration_seconds')->nullable();
            $table->dateTime('published_at')->nullable();
            $table->json('metadata_json')->nullable();
            $table->timestamps();

            $table->unique(['source_id', 'slug']);
            $table->index('level');
            $table->index('published_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('listening_external_lessons');
    }
};
