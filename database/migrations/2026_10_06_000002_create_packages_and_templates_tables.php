<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('packages', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('badge')->nullable();
            $table->decimal('price', 12, 2)->default(0);
            $table->integer('duration_days')->default(90);
            $table->integer('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->boolean('is_popular')->default(false);

            // Numeric Limits
            $table->integer('max_guests')->nullable(); // null = unlimited
            $table->integer('max_photos')->default(3);
            $table->integer('max_music')->default(1);
            $table->boolean('allow_custom_music')->default(false);

            // Feature Toggles
            $table->boolean('allow_custom_slug')->default(false);
            $table->boolean('allow_gift_info')->default(false);
            $table->boolean('allow_love_story')->default(false);
            $table->boolean('allow_countdown')->default(true);
            $table->boolean('allow_streaming')->default(false);
            $table->boolean('allow_multilingual')->default(false);
            $table->boolean('allow_analytics')->default(false);
            $table->boolean('allow_digital_envelope')->default(false);
            $table->boolean('remove_watermark')->default(false);
            $table->boolean('allow_guest_import')->default(false);
            $table->boolean('allow_wa_blast')->default(false);

            $table->softDeletes();
            $table->timestamps();
        });

        Schema::create('template_categories', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->integer('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('templates', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('thumbnail_url')->nullable();
            $table->string('component_name');
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('template_category_tags', function (Blueprint $table) {
            $table->foreignUuid('template_id')->constrained('templates')->cascadeOnDelete();
            $table->foreignUuid('category_id')->constrained('template_categories')->cascadeOnDelete();
            $table->timestamps();

            $table->primary(['template_id', 'category_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('template_category_tags');
        Schema::dropIfExists('templates');
        Schema::dropIfExists('template_categories');
        Schema::dropIfExists('packages');
    }
};
