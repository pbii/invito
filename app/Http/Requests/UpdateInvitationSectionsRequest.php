<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateInvitationSectionsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'sections' => ['required', 'array'],
            'sections.*.id' => ['required', 'uuid', 'exists:invitation_sections,id'],
            'sections.*.custom_title' => ['nullable', 'string', 'max:255'],
            'sections.*.is_enabled' => ['required', 'boolean'],
            'sections.*.sort_order' => ['required', 'integer'],
        ];
    }
}
