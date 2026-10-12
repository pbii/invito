<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreGuestRequest extends FormRequest
{
    public function authorize(): bool
    {
        $invitation = $this->route('invitation');

        return $this->user() !== null && $invitation && $invitation->user_id === $this->user()->id;
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('phone') && $this->phone) {
            $phone = (string) $this->phone;
            $phone = preg_replace('/[^0-9]/', '', $phone);
            if (str_starts_with($phone, '0')) {
                $phone = '62'.substr($phone, 1);
            } elseif (str_starts_with($phone, '8')) {
                $phone = '62'.$phone;
            }
            $this->merge(['phone' => $phone]);
        }
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:20'],
            'email' => ['nullable', 'email', 'max:255'],
            'category' => ['required', 'string', 'in:FAMILY,FRIEND,WORK,VIP,OTHER'],
            'max_pax' => ['nullable', 'integer', 'min:1', 'max:20'],
            'event_ids' => ['nullable', 'array'],
            'event_ids.*' => ['uuid', 'exists:events,id'],
        ];
    }
}
