<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('daily_activities');
    }

    public function down(): void
    {
        Schema::create('daily_activities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')
                ->constrained()
                ->cascadeOnDelete();
            $table->date('date');
            $table->unsignedInteger('lessons_done')->default(0);
            $table->unsignedInteger('clips_done')->default(0);
            $table->unsignedInteger('time_minutes')->default(0);
            $table->unsignedInteger('xp_earned')->default(0);
            $table->timestamps();
            $table->unique(['user_id', 'date']);
            $table->index(['user_id', 'date']);
        });
    }
};
