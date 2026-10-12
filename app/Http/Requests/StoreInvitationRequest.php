<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Models\Package;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreInvitationRequest extends FormRequest
{
    private const RESERVED_SLUGS = [
        'admin',
        'dashboard',
        'login',
        'register',
        'pricing',
        'api',
        'profile',
        'invitation',
        'checkout',
        'settings',
        'feature-flags',
    ];

    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $user = $this->user();
            $packageId = $this->input('package_id');

            if ($user && $packageId) {
                $package = Package::find($packageId);
                if ($package) {
                    $maxAllowed = $package->max_invitations ?? 1;
                    $currentCount = $user->invitations()->count();

                    // If user is not super admin / admin, enforce quota
                    if (! $user->isAdmin() && $currentCount >= $maxAllowed) {
                        $validator->errors()->add(
                            'package_id',
                            "Batas kuota pembuatan undangan untuk paket ini telah tercapai (maksimal {$maxAllowed} website undangan). Silakan hubungi admin atau pilih paket dengan kuota lebih besar."
                        );
                    }
                }
            }
        });
    }

    public function rules(): array
    {
        return [
            'template_id' => ['required', 'uuid', 'exists:templates,id'],
            'package_id' => ['required', 'uuid', 'exists:packages,id'],
            'slug' => [
                'required',
                'string',
                'max:100',
                'regex:/^[a-z0-9\-]+$/i',
                'unique:invitations,slug',
                Rule::notIn(self::RESERVED_SLUGS),
            ],
            'groom_name' => ['required', 'string', 'max:255'],
            'groom_father' => ['nullable', 'string', 'max:255'],
            'groom_mother' => ['nullable', 'string', 'max:255'],
            'groom_photo' => ['nullable', 'string'],
            'bride_name' => ['required', 'string', 'max:255'],
            'bride_father' => ['nullable', 'string', 'max:255'],
            'bride_mother' => ['nullable', 'string', 'max:255'],
            'bride_photo' => ['nullable', 'string'],
            'music_url' => ['nullable', 'string', 'max:500'],
            'streaming_url' => ['nullable', 'url', 'max:500'],
            'language' => ['required', 'in:id,en'],

            // Events
            'events' => ['required', 'array', 'min:1'],
            'events.*.event_type_id' => ['nullable', 'uuid', 'exists:event_types,id'],
            'events.*.event_name' => ['required', 'string', 'max:255'],
            'events.*.date' => ['required', 'date'],
            'events.*.time_start' => ['nullable', 'string', 'max:10'],
            'events.*.time_end' => ['nullable', 'string', 'max:10'],
            'events.*.venue_name' => ['required', 'string', 'max:255'],
            'events.*.address' => ['nullable', 'string'],
            'events.*.latitude' => ['nullable', 'numeric'],
            'events.*.longitude' => ['nullable', 'numeric'],

            // Bank Accounts
            'bank_accounts' => ['nullable', 'array'],
            'bank_accounts.*.provider_id' => ['nullable', 'uuid', 'exists:payment_providers,id'],
            'bank_accounts.*.bank_or_wallet_name' => ['required_with:bank_accounts', 'string', 'max:255'],
            'bank_accounts.*.account_number' => ['required_with:bank_accounts', 'string', 'max:100'],
            'bank_accounts.*.account_holder' => ['required_with:bank_accounts', 'string', 'max:255'],
            'bank_accounts.*.qr_code_url' => ['nullable', 'string'],

            // Love Stories
            'love_stories' => ['nullable', 'array'],
            'love_stories.*.title' => ['required_with:love_stories', 'string', 'max:255'],
            'love_stories.*.description' => ['nullable', 'string'],
            'love_stories.*.date' => ['nullable', 'date'],

            // Gallery Photos
            'gallery_photos' => ['nullable', 'array'],
            'gallery_photos.*.photo_url' => ['required_with:gallery_photos', 'string'],
            'gallery_photos.*.caption' => ['nullable', 'string', 'max:255'],
        ];
    }
}
