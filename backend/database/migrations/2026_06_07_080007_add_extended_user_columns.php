<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('avatar_url')->nullable()->after('email');
            $table->unsignedInteger('current_streak')->default(0)->after('avatar_url');
            $table->unsignedInteger('longest_streak')->default(0)->after('current_streak');
            $table->date('streak_start_date')->nullable()->after('longest_streak');
            $table->date('last_lesson_date')->nullable()->after('streak_start_date');
            $table->unsignedInteger('total_xp')->default(0)->after('last_lesson_date');
            $table->unsignedInteger('level')->default(1)->after('total_xp');
            $table->string('learning_goal', 20)->nullable()->after('level');
            $table->string('timezone', 50)->default('UTC')->after('learning_goal');
            $table->unsignedInteger('daily_goal_minutes')->default(10)->after('timezone');
            $table->boolean('onboarding_completed')->default(false)->after('daily_goal_minutes');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'avatar_url',
                'current_streak',
                'longest_streak',
                'streak_start_date',
                'last_lesson_date',
                'total_xp',
                'level',
                'learning_goal',
                'timezone',
                'daily_goal_minutes',
                'onboarding_completed',
            ]);
        });
    }
};
