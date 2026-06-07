<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
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

            // One record per user per date
            $table->unique(['user_id', 'date']);

            // Weekly/monthly aggregation queries
            $table->index(['user_id', 'date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('daily_activities');
    }
};
