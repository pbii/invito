<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\MessageTemplate;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class AdminMessageTemplateController extends Controller
{
    public function index(Request $request): Response
    {
        $query = MessageTemplate::query();

        if ($search = $request->input('search')) {
            $query->where('name', 'like', "%{$search}%")->orWhere('content', 'like', "%{$search}%");
        }

        if ($lang = $request->input('language')) {
            if ($lang !== 'all') {
                $query->where('language', $lang);
            }
        }

        $templates = $query->latest()->paginate(10)->withQueryString();

        return Inertia::render('Admin/MessageTemplates/Index', [
            'templates' => $templates,
            'filters' => [
                'search' => $request->input('search', ''),
                'language' => $request->input('language', 'all'),
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'language' => ['required', 'in:id,en'],
            'content' => ['required', 'string'],
            'is_default' => ['boolean'],
        ]);

        MessageTemplate::create([
            'id' => (string) Str::uuid(),
            'name' => $validated['name'],
            'language' => $validated['language'],
            'content' => $validated['content'],
            'is_default' => $validated['is_default'] ?? false,
        ]);

        return redirect()->back()->with('success', 'Template pesan WhatsApp berhasil ditambahkan!');
    }

    public function update(Request $request, MessageTemplate $messageTemplate): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'language' => ['required', 'in:id,en'],
            'content' => ['required', 'string'],
            'is_default' => ['boolean'],
        ]);

        $messageTemplate->update($validated);

        return redirect()->back()->with('success', 'Template pesan WhatsApp berhasil diperbarui!');
    }

    public function destroy(MessageTemplate $messageTemplate): RedirectResponse
    {
        $messageTemplate->delete();

        return redirect()->back()->with('success', 'Template pesan WhatsApp berhasil dihapus!');
    }
}
