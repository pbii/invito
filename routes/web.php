<?php

use App\Http\Controllers\Admin\AdminDashboardController;
use App\Http\Controllers\Admin\AdminEventTypeController;
use App\Http\Controllers\Admin\AdminFeatureFlagController;
use App\Http\Controllers\Admin\AdminInvitationController;
use App\Http\Controllers\Admin\AdminMessageTemplateController;
use App\Http\Controllers\Admin\AdminPackageController;
use App\Http\Controllers\Admin\AdminPaymentProviderController;
use App\Http\Controllers\Admin\AdminSettingController;
use App\Http\Controllers\Admin\AdminTemplateCategoryController;
use App\Http\Controllers\Admin\AdminTemplateController;
use App\Http\Controllers\Admin\AdminThemePresetController;
use App\Http\Controllers\Admin\AdminUserController;
use App\Http\Controllers\Couple\DashboardController;
use App\Http\Controllers\Couple\GuestController;
use App\Http\Controllers\Couple\InvitationController;
use App\Http\Controllers\Couple\SectionController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Public\InvitationViewController;
use App\Http\Controllers\Public\PublicRsvpController;
use App\Http\Middleware\HandleInertiaRequests;
use App\Models\Package;
use App\Models\Template;
use App\Models\TemplateCategory;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware([HandleInertiaRequests::class])->group(function () {
    Route::get('/', function () {
        $templates = Template::where('is_active', true)
            ->with('categories')
            ->orderBy('sort_order')
            ->get();
        $categories = TemplateCategory::orderBy('sort_order')->get();
        $packages = Package::where('is_active', true)->orderBy('price')->get();

        return Inertia::render('Welcome', [
            'canLogin' => Route::has('login'),
            'canRegister' => Route::has('register'),
            'templates' => $templates,
            'categories' => $categories,
            'packages' => $packages,
        ]);
    });

    Route::middleware(['auth'])->group(function () {
        // Invitation & Couple routes (Blocked for Super Admin, accessible by Administrator & Couple)
        Route::middleware(['can.manage.invitations'])->group(function () {
            Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

            // Couple Invitation Routes
            Route::get('/invitation/create', [InvitationController::class, 'create'])->name('invitation.create');
            Route::post('/invitation', [InvitationController::class, 'store'])->name('invitation.store');
            Route::get('/invitation/{invitation}/sections', [SectionController::class, 'index'])->name('invitation.sections');
            Route::put('/invitation/{invitation}/sections', [SectionController::class, 'update'])->name('invitation.sections.update');
            Route::get('/invitation/{invitation}/edit', [InvitationController::class, 'edit'])->name('invitation.edit');
            Route::put('/invitation/{invitation}', [InvitationController::class, 'update'])->name('invitation.update');

            // Guest Management
            Route::get('/invitation/{invitation}/guests', [GuestController::class, 'index'])->name('invitation.guests.index');
            Route::post('/invitation/{invitation}/guests', [GuestController::class, 'store'])->name('invitation.guests.store');
            Route::put('/invitation/{invitation}/guests/{guest}', [GuestController::class, 'update'])->name('invitation.guests.update');
            Route::delete('/invitation/{invitation}/guests/{guest}', [GuestController::class, 'destroy'])->name('invitation.guests.destroy');
            Route::patch('/invitation/{invitation}/guests/{guest}/toggle-sent', [GuestController::class, 'toggleSent'])->name('invitation.guests.toggle-sent');
        });

        // Profile
        Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
        Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
        Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    });

    // ==========================================
    // Super Admin Routes (Inertia.js + React SPA)
    // ==========================================
    Route::middleware(['auth', 'admin'])->prefix('admin')->name('admin.')->group(function () {
        Route::get('/', [AdminDashboardController::class, 'index'])->name('dashboard');
        Route::resource('users', AdminUserController::class)->only(['index', 'store', 'update', 'destroy']);
        Route::resource('invitations', AdminInvitationController::class)->only(['index', 'destroy']);
        Route::resource('packages', AdminPackageController::class)->only(['index', 'store', 'update', 'destroy']);
        Route::resource('templates', AdminTemplateController::class)->only(['index', 'store', 'update', 'destroy']);
        Route::resource('template-categories', AdminTemplateCategoryController::class)->only(['index', 'store', 'update', 'destroy']);
        Route::resource('payment-providers', AdminPaymentProviderController::class)->only(['index', 'store', 'update', 'destroy']);
        Route::resource('event-types', AdminEventTypeController::class)->only(['index', 'store', 'update', 'destroy']);
        Route::resource('message-templates', AdminMessageTemplateController::class)->only(['index', 'store', 'update', 'destroy']);
        Route::get('settings', [AdminSettingController::class, 'index'])->name('settings.index');
        Route::put('settings', [AdminSettingController::class, 'update'])->name('settings.update');
        Route::post('theme-presets', [AdminThemePresetController::class, 'store'])->name('theme-presets.store');
        Route::put('theme-presets/{themePreset}', [AdminThemePresetController::class, 'update'])->name('theme-presets.update');
        Route::delete('theme-presets/{themePreset}', [AdminThemePresetController::class, 'destroy'])->name('theme-presets.destroy');
        Route::post('theme-presets/{themePreset}/apply', [AdminThemePresetController::class, 'apply'])->name('theme-presets.apply');
        Route::get('feature-flags', [AdminFeatureFlagController::class, 'index'])->name('feature-flags.index');
        Route::put('feature-flags', [AdminFeatureFlagController::class, 'update'])->name('feature-flags.update');
    });

    require __DIR__.'/auth.php';

    // Public Guest Invitation Routes
    Route::post('/{slug}/rsvp', [PublicRsvpController::class, 'store'])
        ->middleware('throttle:30,1')
        ->name('invitation.rsvp');

    Route::post('/{slug}/wishes', [PublicWishController::class, 'store'])
        ->middleware('throttle:30,1')
        ->name('public.wishes.store');

    Route::get('/{slug}', [InvitationViewController::class, 'show'])
        ->name('invitation.show');
});
