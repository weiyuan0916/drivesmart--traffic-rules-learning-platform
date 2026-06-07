<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('lessons', function (Blueprint $table) {
            $table->unsignedBigInteger('practice_count')->default(0)->after('order_index');
            $table->decimal('avg_accuracy', 5, 2)->default(0)->after('practice_count');
        });
    }

    public function down(): void
    {
        Schema::table('lessons', function (Blueprint $table) {
            $table->dropColumn(['practice_count', 'avg_accuracy']);
        });
    }
};
