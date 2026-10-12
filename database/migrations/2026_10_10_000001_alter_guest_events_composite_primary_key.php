<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('guest_events');

        Schema::create('guest_events', function (Blueprint $table) {
            $table->foreignUuid('guest_id')->constrained('guests')->cascadeOnDelete();
            $table->foreignUuid('event_id')->constrained('events')->cascadeOnDelete();
            $table->boolean('is_invited')->default(true);
            $table->timestamps();

            $table->primary(['guest_id', 'event_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('guest_events');

        Schema::create('guest_events', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('guest_id')->constrained('guests')->cascadeOnDelete();
            $table->foreignUuid('event_id')->constrained('events')->cascadeOnDelete();
            $table->boolean('is_invited')->default(true);
            $table->timestamps();

            $table->unique(['guest_id', 'event_id']);
        });
    }
};
