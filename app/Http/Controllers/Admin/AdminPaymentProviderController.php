<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PaymentProvider;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class AdminPaymentProviderController extends Controller
{
    public function index(Request $request): Response
    {
        $query = PaymentProvider::query();

        if ($search = $request->input('search')) {
            $query->where('name', 'like', "%{$search}%")->orWhere('code', 'like', "%{$search}%");
        }

        if ($type = $request->input('type')) {
            if ($type !== 'all') {
                $query->where('type', $type);
            }
        }

        $providers = $query->orderBy('sort_order', 'asc')->paginate(10)->withQueryString();

        return Inertia::render('Admin/PaymentProviders/Index', [
            'providers' => $providers,
            'filters' => [
                'search' => $request->input('search', ''),
                'type' => $request->input('type', 'all'),
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'code' => ['required', 'string', 'max:50', 'unique:payment_providers,code'],
            'type' => ['required', 'in:BANK,EWALLET,QRIS'],
            'logo_url' => ['nullable', 'string'],
            'sort_order' => ['nullable', 'integer'],
            'is_active' => ['boolean'],
        ]);

        PaymentProvider::create([
            'id' => (string) Str::uuid(),
            'name' => $validated['name'],
            'code' => $validated['code'],
            'type' => $validated['type'],
            'logo_url' => $validated['logo_url'] ?? null,
            'sort_order' => $validated['sort_order'] ?? 0,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return redirect()->back()->with('success', 'Metode pembayaran berhasil ditambahkan!');
    }

    public function update(Request $request, PaymentProvider $paymentProvider): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'code' => ['required', 'string', 'max:50', 'unique:payment_providers,code,'.$paymentProvider->id],
            'type' => ['required', 'in:BANK,EWALLET,QRIS'],
            'logo_url' => ['nullable', 'string'],
            'sort_order' => ['nullable', 'integer'],
            'is_active' => ['boolean'],
        ]);

        $paymentProvider->update($validated);

        return redirect()->back()->with('success', 'Metode pembayaran berhasil diperbarui!');
    }

    public function destroy(PaymentProvider $paymentProvider): RedirectResponse
    {
        $paymentProvider->delete();

        return redirect()->back()->with('success', 'Metode pembayaran berhasil dihapus!');
    }
}
