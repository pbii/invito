<?php

declare(strict_types=1);

namespace App\Http\Controllers\Couple;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateInvitationSectionsRequest;
use App\Models\Invitation;
use App\Models\InvitationSection;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class SectionController extends Controller
{
    public function index(Request $request, Invitation $invitation): Response
    {
        if ($invitation->user_id !== $request->user()->id) {
            abort(403, 'Akses tidak diizinkan.');
        }

        $sections = $invitation->sections()
            ->orderBy('sort_order')
            ->get();

        return Inertia::render('Couple/Invitation/Sections', [
            'invitation' => $invitation,
            'sections' => $sections,
        ]);
    }

    public function update(UpdateInvitationSectionsRequest $request, Invitation $invitation): RedirectResponse
    {
        if ($invitation->user_id !== $request->user()->id) {
            abort(403, 'Akses tidak diizinkan.');
        }

        $validated = $request->validated();

        DB::transaction(function () use ($invitation, $validated) {
            foreach ($validated['sections'] as $secData) {
                InvitationSection::where('id', $secData['id'])
                    ->where('invitation_id', $invitation->id)
                    ->update([
                        'custom_title' => $secData['custom_title'] ?? null,
                        'is_enabled' => $secData['is_enabled'],
                        'sort_order' => $secData['sort_order'],
                    ]);
            }
        });

        return back()->with('success', 'Urutan dan tata letak section berhasil diperbarui!');
    }
}
