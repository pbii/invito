<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RoleAccessControlTest extends TestCase
{
    use RefreshDatabase;

    public function test_super_admin_cannot_access_invitation_dashboard_and_is_redirected_to_admin(): void
    {
        $superAdmin = User::factory()->create([
            'role' => 'SUPER_ADMIN',
            'is_active' => true,
        ]);

        $response = $this->actingAs($superAdmin)->get('/dashboard');
        $response->assertRedirect(route('admin.dashboard'));

        $createResponse = $this->actingAs($superAdmin)->get('/invitation/create');
        $createResponse->assertRedirect(route('admin.dashboard'));
    }

    public function test_super_admin_can_access_admin_control_panel(): void
    {
        $superAdmin = User::factory()->create([
            'role' => 'SUPER_ADMIN',
            'is_active' => true,
        ]);

        $response = $this->actingAs($superAdmin)->get('/admin');
        $response->assertOk();
    }

    public function test_administrator_cannot_access_admin_control_panel(): void
    {
        $admin = User::factory()->create([
            'role' => 'ADMIN',
            'is_active' => true,
        ]);

        $response = $this->actingAs($admin)->get('/admin');
        $response->assertRedirect(route('dashboard'));
    }

    public function test_administrator_can_access_invitation_dashboard_and_create(): void
    {
        $admin = User::factory()->create([
            'role' => 'ADMIN',
            'is_active' => true,
        ]);

        $response = $this->actingAs($admin)->get('/dashboard');
        $response->assertOk();

        $createResponse = $this->actingAs($admin)->get('/invitation/create');
        $createResponse->assertOk();
    }

    public function test_couple_cannot_access_admin_control_panel(): void
    {
        $couple = User::factory()->create([
            'role' => 'COUPLE',
            'is_active' => true,
        ]);

        $response = $this->actingAs($couple)->get('/admin');
        $response->assertRedirect(route('dashboard'));
    }

    public function test_couple_can_access_invitation_dashboard_and_create(): void
    {
        $couple = User::factory()->create([
            'role' => 'COUPLE',
            'is_active' => true,
        ]);

        $response = $this->actingAs($couple)->get('/dashboard');
        $response->assertOk();

        $createResponse = $this->actingAs($couple)->get('/invitation/create');
        $createResponse->assertOk();
    }
}
