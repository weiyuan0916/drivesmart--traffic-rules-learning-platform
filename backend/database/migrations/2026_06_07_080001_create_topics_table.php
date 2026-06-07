<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('topics', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('name');
            $table->string('name_vi')->nullable();
            $table->text('description')->nullable();
            $table->text('description_vi')->nullable();
            $table->string('icon')->nullable();           // SVG name or emoji
            $table->string('color', 7)->nullable();       // hex color e.g. #FF5632
            $table->unsignedInteger('order_index')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->index('order_index');
            $table->index('is_active');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('topics');
    }
};
