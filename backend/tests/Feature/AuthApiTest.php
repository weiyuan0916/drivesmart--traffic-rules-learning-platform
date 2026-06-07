<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthApiTest extends TestCase
{
    use RefreshDatabase;

    // ======================================================================
    // POST /api/v1/auth/register
    // ======================================================================

    public function test_register_creates_user_and_returns_token(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'data' => [
                    'user' => ['id', 'name', 'email', 'level', 'total_xp', 'current_streak'],
                    'token',
                    'token_type',
                ],
            ]);

        $this->assertDatabaseHas('users', ['email' => 'test@example.com']);
    }

    public function test_register_requires_name(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'email' => 'test@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertStatus(422);
    }

    public function test_register_requires_unique_email(): void
    {
        User::factory()->create(['email' => 'test@example.com']);

        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertStatus(422);
    }

    public function test_register_requires_password_confirmation(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'password123',
            'password_confirmation' => 'different',
        ]);

        $response->assertStatus(422);
    }

    public function test_register_sets_default_streak_xp_values(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.user.current_streak', 0)
            ->assertJsonPath('data.user.longest_streak', 0)
            ->assertJsonPath('data.user.total_xp', 0)
            ->assertJsonPath('data.user.level', 1);
    }

    // ======================================================================
    // POST /api/v1/auth/login
    // ======================================================================

    public function test_login_returns_token_for_valid_credentials(): void
    {
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => bcrypt('password123'),
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'test@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => ['user', 'token', 'token_type'],
            ])
            ->assertJsonPath('data.user.email', 'test@example.com');
    }

    public function test_login_returns_401_for_invalid_password(): void
    {
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => bcrypt('password123'),
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'test@example.com',
            'password' => 'wrongpassword',
        ]);

        $response->assertStatus(401)
            ->assertJsonPath('code', 'E_AUTH_001');
    }

    public function test_login_returns_401_for_nonexistent_email(): void
    {
        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'nonexistent@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(401);
    }

    // ======================================================================
    // GET /api/v1/auth/me
    // ======================================================================

    public function test_me_returns_401_without_token(): void
    {
        $response = $this->getJson('/api/v1/auth/me');
        $response->assertStatus(401);
    }

    public function test_me_returns_user_data_with_valid_token(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/v1/auth/me');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'id', 'name', 'email', 'level',
                    'total_xp', 'current_streak', 'longest_streak',
                ],
            ]);
    }

    // ======================================================================
    // POST /api/v1/auth/logout
    // ======================================================================

    public function test_logout_returns_401_without_token(): void
    {
        $response = $this->postJson('/api/v1/auth/logout');
        $response->assertStatus(401);
    }

    public function test_logout_revokes_token(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/v1/auth/logout');

        $response->assertStatus(200);
    }

    // ======================================================================
    // PATCH /api/v1/auth/profile
    // ======================================================================

    public function test_update_profile_returns_401_without_token(): void
    {
        $response = $this->patchJson('/api/v1/auth/profile', [
            'name' => 'New Name',
        ]);
        $response->assertStatus(401);
    }

    public function test_update_profile_updates_name(): void
    {
        $user = User::factory()->create(['name' => 'Old Name']);
        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->patchJson('/api/v1/auth/profile', [
                'name' => 'New Name',
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.name', 'New Name');
    }

    public function test_update_profile_validates_daily_goal_minutes_range(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->patchJson('/api/v1/auth/profile', [
                'daily_goal_minutes' => 120, // exceeds max of 60
            ]);

        $response->assertStatus(422);
    }
}
