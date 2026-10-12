<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('guests', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('invitation_id')->constrained('invitations')->cascadeOnDelete();
            $table->string('name');
            $table->string('phone')->nullable(); // format E.164: 62812...
            $table->string('email')->nullable();
            $table->enum('category', ['FAMILY', 'FRIEND', 'WORK', 'OTHER'])->default('FRIEND');
            $table->string('personal_link_token')->unique(); // NanoID / Unique safe token
            $table->boolean('is_sent')->default(false); // status wa blast / sent
            $table->boolean('is_deleted')->default(false);
            $table->softDeletes();
            $table->timestamps();
        });

        Schema::create('rsvps', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('invitation_id')->constrained('invitations')->cascadeOnDelete();
            $table->foreignUuid('guest_id')->nullable()->constrained('guests')->nullOnDelete();
            $table->string('name');
            $table->boolean('is_attending')->default(true);
            $table->integer('number_of_guests')->default(1);
            $table->text('notes')->nullable();
            $table->string('ip_address')->nullable();
            $table->boolean('turnstile_verified')->default(false);
            $table->timestamps();
        });

        Schema::create('rsvp_events', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('rsvp_id')->constrained('rsvps')->cascadeOnDelete();
            $table->foreignUuid('event_id')->constrained('events')->cascadeOnDelete();
            $table->boolean('is_attending')->default(true);
            $table->timestamps();

            $table->unique(['rsvp_id', 'event_id']);
        });

        Schema::create('wishes', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('invitation_id')->constrained('invitations')->cascadeOnDelete();
            $table->string('name');
            $table->text('message');
            $table->boolean('is_visible')->default(true);
            $table->boolean('turnstile_verified')->default(false);
            $table->timestamps();
        });

        Schema::create('invitation_views', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('invitation_id')->constrained('invitations')->cascadeOnDelete();
            $table->string('ip_address')->nullable();
            $table->text('user_agent')->nullable();
            $table->string('referrer')->nullable();
            $table->enum('device_type', ['mobile', 'desktop', 'tablet'])->default('mobile');
            $table->string('browser')->nullable();
            $table->timestamp('created_at')->useCurrent();
        });

        Schema::create('digital_envelopes', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('invitation_id')->constrained('invitations')->cascadeOnDelete();
            $table->string('sender_name');
            $table->decimal('amount', 14, 2)->default(0);
            $table->enum('method', ['QRIS', 'BANK_TRANSFER', 'EWALLET'])->default('BANK_TRANSFER');
            $table->enum('payment_status', ['PENDING', 'CONFIRMED', 'UNVERIFIED_CLAIM', 'REJECTED'])->default('PENDING');
            $table->string('payment_gateway_id')->nullable();
            $table->string('proof_image_url')->nullable();
            $table->boolean('is_verified_by_couple')->default(false);
            $table->text('note')->nullable();
            $table->timestamps();
        });

        Schema::create('transactions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignUuid('invitation_id')->constrained('invitations')->cascadeOnDelete();
            $table->foreignUuid('package_id')->constrained('packages')->restrictOnDelete();
            $table->decimal('amount', 12, 2)->default(0);
            $table->string('payment_method')->nullable();
            $table->enum('payment_status', [
                'PENDING',
                'SETTLEMENT',
                'CAPTURE_SUCCESS',
                'DENY',
                'EXPIRE',
                'CANCEL',
                'REFUNDED',
            ])->default('PENDING');
            $table->string('payment_gateway_id')->nullable(); // Midtrans order_id / transaction_id
            $table->string('payment_proof_url')->nullable();
            $table->foreignUuid('verified_by')->nullable()->references('id')->on('users')->nullOnDelete();
            $table->timestamp('verified_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transactions');
        Schema::dropIfExists('digital_envelopes');
        Schema::dropIfExists('invitation_views');
        Schema::dropIfExists('wishes');
        Schema::dropIfExists('rsvp_events');
        Schema::dropIfExists('rsvps');
        Schema::dropIfExists('guests');
    }
};
