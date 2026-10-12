<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('invitations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('slug')->unique();
            $table->string('groom_name');
            $table->string('groom_photo')->nullable();
            $table->string('groom_photo_public_id')->nullable();
            $table->string('groom_father')->nullable();
            $table->string('groom_mother')->nullable();
            $table->string('bride_name');
            $table->string('bride_photo')->nullable();
            $table->string('bride_photo_public_id')->nullable();
            $table->string('bride_father')->nullable();
            $table->string('bride_mother')->nullable();
            $table->foreignUuid('template_id')->constrained('templates')->restrictOnDelete();
            $table->foreignUuid('package_id')->constrained('packages')->restrictOnDelete();
            $table->string('music_url')->nullable();
            $table->string('music_public_id')->nullable();
            $table->string('streaming_url')->nullable();
            $table->enum('language', ['id', 'en'])->default('id');
            $table->boolean('is_published')->default(false);
            $table->string('qris_image_url')->nullable();
            $table->string('qris_public_id')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->boolean('is_expired')->default(false);
            $table->timestamps();
        });

        Schema::create('invitation_sections', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('invitation_id')->constrained('invitations')->cascadeOnDelete();
            $table->string('section_key'); // e.g., 'COUPLE', 'COUNTDOWN', 'EVENTS', 'MAPS', 'STORY', 'GALLERY', 'GIFT', 'ENVELOPE', 'STREAMING', 'RSVP', 'WISHES'
            $table->string('custom_title')->nullable();
            $table->boolean('is_enabled')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();

            $table->unique(['invitation_id', 'section_key']);
        });

        Schema::create('invitation_bank_accounts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('invitation_id')->constrained('invitations')->cascadeOnDelete();
            $table->foreignUuid('provider_id')->nullable()->constrained('payment_providers')->nullOnDelete();
            $table->string('bank_or_wallet_name');
            $table->string('account_number');
            $table->string('account_holder');
            $table->string('qr_code_url')->nullable();
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('events', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('invitation_id')->constrained('invitations')->cascadeOnDelete();
            $table->foreignUuid('event_type_id')->nullable()->constrained('event_types')->nullOnDelete();
            $table->string('event_name');
            $table->date('date');
            $table->time('time_start')->nullable();
            $table->time('time_end')->nullable();
            $table->string('venue_name');
            $table->text('address')->nullable();
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->timestamps();
        });

        Schema::create('love_stories', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('invitation_id')->constrained('invitations')->cascadeOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->date('date')->nullable();
            $table->integer('order')->default(0);
            $table->timestamps();
        });

        Schema::create('gallery_photos', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('invitation_id')->constrained('invitations')->cascadeOnDelete();
            $table->string('photo_url');
            $table->string('cloudinary_public_id')->nullable();
            $table->string('caption')->nullable();
            $table->integer('order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('gallery_photos');
        Schema::dropIfExists('love_stories');
        Schema::dropIfExists('events');
        Schema::dropIfExists('invitation_bank_accounts');
        Schema::dropIfExists('invitation_sections');
        Schema::dropIfExists('invitations');
    }
};
