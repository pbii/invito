<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreRsvpRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'guest_id' => ['nullable', 'uuid', 'exists:guests,id'],
            'name' => ['required', 'string', 'max:255'],
            'is_attending' => ['required', 'boolean'],
            'number_of_guests' => ['required', 'integer', 'min:1', 'max:10'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'turnstile_token' => ['nullable', 'string'],
            'events' => ['required', 'array', 'min:1'],
            'events.*.event_id' => ['required', 'uuid', 'exists:events,id'],
            'events.*.is_attending' => ['required', 'boolean'],
            'honeypot' => ['nullable', 'max:0'],
        ];
    }
}
