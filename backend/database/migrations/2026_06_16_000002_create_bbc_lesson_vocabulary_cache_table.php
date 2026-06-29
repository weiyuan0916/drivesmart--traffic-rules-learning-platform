<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * BBC Listening — Vocabulary cache (word + brief meaning only).
     *
     * Compliance: .cursor/rules/bbc-feature.mdc
     * Only stores publicly-visible vocabulary metadata scraped from the BBC
     * episode page DOM (word + brief one-line meaning). It does NOT store
     * transcript, audio, or any extended definition beyond what BBC
     * already exposes on the public episode page.
     *
     * The brief_meaning field is capped at 500 characters to ensure we
     * only cache short snippet metadata, not BBC's full glossary
     * definitions.
     */
    public function up(): void
    {
        Schema::create('bbc_lesson_vocabulary_cache', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lesson_id')
                ->constrained('listening_external_lessons')
                ->cascadeOnDelete();
            $table->string('word', 100);
            $table->string('brief_meaning', 500)->nullable();
            $table->unsignedInteger('position')->default(0);
            $table->timestamps();

            $table->unique(['lesson_id', 'word']);
            $table->index(['lesson_id', 'position']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bbc_lesson_vocabulary_cache');
    }
};
