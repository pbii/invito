<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserCanManageInvitations
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user) {
            return redirect()->route('login');
        }

        // Super Admin does not manage invitations; redirect to Control Panel
        if ($user->isSuperAdmin()) {
            if ($request->expectsJson()) {
                return response()->json(['message' => 'Super Administrator cannot create or manage invitations.'], 403);
            }

            return redirect()->route('admin.dashboard')->with('error', 'Super Administrator hanya memiliki akses ke Control Panel.');
        }

        // Only ADMIN and COUPLE can manage invitations
        if (! $user->canManageInvitations() || ! $user->is_active) {
            if ($request->expectsJson()) {
                return response()->json(['message' => 'Unauthorized action.'], 403);
            }

            return redirect()->route('login')->with('error', 'Akun Anda tidak memiliki akses untuk membuat undangan.');
        }

        return $next($request);
    }
}
