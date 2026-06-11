<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('topic_id')
                ->constrained()
                ->cascadeOnDelete();
            $table->string('name');
            $table->string('slug');
            $table->unsignedInteger('order_index')->default(0);
            $table->string('vocab_level', 20)->nullable();
            $table->unsignedInteger('lesson_count')->default(0);
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['topic_id', 'slug']);
            $table->index(['topic_id', 'order_index']);
        });

        Schema::table('lessons', function (Blueprint $table) {
            $table->foreignId('section_id')
                ->nullable()
                ->after('topic_id')
                ->constrained('sections')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('lessons', function (Blueprint $table) {
            $table->dropForeign(['section_id']);
            $table->dropColumn('section_id');
        });
        Schema::dropIfExists('sections');
    }
};
