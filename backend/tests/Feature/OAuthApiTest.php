<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Laravel\Socialite\Contracts\Factory as SocialiteFactory;
use Laravel\Socialite\Facades\Socialite;
use Mockery;
use Tests\TestCase;

class OAuthApiTest extends TestCase
{
    use LazilyRefreshDatabase;

    // ======================================================================
    // GET /api/v1/auth/{provider}/redirect
    // ======================================================================

    public function test_google_redirect_returns_oauth_url(): void
    {
        $response = $this->getJson('/api/v1/auth/google/redirect');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => ['redirect_url'],
            ]);

        $this->assertStringContainsString('accounts.google.com', $response->json('data.redirect_url'));
    }

    public function test_github_redirect_returns_oauth_url(): void
    {
        $response = $this->getJson('/api/v1/auth/github/redirect');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => ['redirect_url'],
            ]);

        $this->assertStringContainsString('github.com', $response->json('data.redirect_url'));
    }

    public function test_unsupported_provider_returns_404(): void
    {
        $response = $this->getJson('/api/v1/auth/twitter/redirect');
        $response->assertStatus(404);
    }

    // ======================================================================
    // GET /api/v1/auth/{provider}/callback — Google
    // ======================================================================

    public function test_google_callback_creates_new_user(): void
    {
        $abstractUser = Mockery::mock('Laravel\Socialite\Two\User');
        $abstractUser->shouldReceive('getId')->andReturn('google-12345');
        $abstractUser->shouldReceive('getEmail')->andReturn('google@example.com');
        $abstractUser->shouldReceive('getName')->andReturn('Google User');
        $abstractUser->shouldReceive('getNickname')->andReturn('googleuser');
        $abstractUser->shouldReceive('getAvatar')->andReturn('https://avatar.google.com/photo.jpg');

        Socialite::shouldReceive('driver->stateless->user')
            ->once()
            ->andReturn($abstractUser);

        $frontendUrl = config('app.frontend_url', 'http://localhost:3000');
        $response = $this->get('/api/v1/auth/google/callback');

        $response->assertStatus(302); // Redirects to frontend
        $redirectUrl = $response->headers->get('Location');
        $this->assertStringStartsWith($frontendUrl . '/auth/callback', $redirectUrl);
        $this->assertStringContainsString('token=', $redirectUrl);
        $this->assertStringContainsString('user=', $redirectUrl);

        $this->assertDatabaseHas('users', [
            'email' => 'google@example.com',
            'name' => 'Google User',
            'google_id' => 'google-12345',
        ]);
    }

    public function test_google_callback_links_existing_user_by_email(): void
    {
        $existingUser = User::factory()->create([
            'email' => 'google@example.com',
            'name' => 'Existing User',
            'google_id' => null,
        ]);

        $abstractUser = Mockery::mock('Laravel\Socialite\Two\User');
        $abstractUser->shouldReceive('getId')->andReturn('google-12345');
        $abstractUser->shouldReceive('getEmail')->andReturn('google@example.com');
        $abstractUser->shouldReceive('getName')->andReturn('Google User');
        $abstractUser->shouldReceive('getNickname')->andReturn('googleuser');
        $abstractUser->shouldReceive('getAvatar')->andReturn('https://avatar.google.com/photo.jpg');

        Socialite::shouldReceive('driver->stateless->user')
            ->once()
            ->andReturn($abstractUser);

        $response = $this->get('/api/v1/auth/google/callback');
        $response->assertStatus(302);

        $this->assertDatabaseHas('users', [
            'email' => 'google@example.com',
            'google_id' => 'google-12345',
        ]);

        // Should not create a duplicate
        $this->assertEquals(1, User::where('email', 'google@example.com')->count());
    }

    public function test_google_callback_updates_avatar_when_changed(): void
    {
        $existingUser = User::factory()->create([
            'email' => 'google@example.com',
            'avatar_url' => 'https://old-avatar.com/photo.jpg',
        ]);

        $abstractUser = Mockery::mock('Laravel\Socialite\Two\User');
        $abstractUser->shouldReceive('getId')->andReturn('google-12345');
        $abstractUser->shouldReceive('getEmail')->andReturn('google@example.com');
        $abstractUser->shouldReceive('getName')->andReturn('Google User');
        $abstractUser->shouldReceive('getNickname')->andReturn('googleuser');
        $abstractUser->shouldReceive('getAvatar')->andReturn('https://new-avatar.com/photo.jpg');

        Socialite::shouldReceive('driver->stateless->user')
            ->once()
            ->andReturn($abstractUser);

        $this->get('/api/v1/auth/google/callback');

        $existingUser->refresh();
        $this->assertEquals('https://new-avatar.com/photo.jpg', $existingUser->avatar_url);
    }

    // ======================================================================
    // GET /api/v1/auth/{provider}/callback — GitHub
    // ======================================================================

    public function test_github_callback_creates_new_user(): void
    {
        $abstractUser = Mockery::mock('Laravel\Socialite\Two\User');
        $abstractUser->shouldReceive('getId')->andReturn('github-67890');
        $abstractUser->shouldReceive('getEmail')->andReturn('github@example.com');
        $abstractUser->shouldReceive('getName')->andReturn('GitHub User');
        $abstractUser->shouldReceive('getNickname')->andReturn('githubuser');
        $abstractUser->shouldReceive('getAvatar')->andReturn('https://avatars.githubusercontent.com/photo.jpg');

        Socialite::shouldReceive('driver->stateless->user')
            ->once()
            ->andReturn($abstractUser);

        $frontendUrl = config('app.frontend_url', 'http://localhost:3000');
        $response = $this->get('/api/v1/auth/github/callback');

        $response->assertStatus(302);
        $redirectUrl = $response->headers->get('Location');
        $this->assertStringStartsWith($frontendUrl . '/auth/callback', $redirectUrl);
        $this->assertStringContainsString('token=', $redirectUrl);

        $this->assertDatabaseHas('users', [
            'email' => 'github@example.com',
            'github_id' => 'github-67890',
        ]);
    }

    public function test_github_callback_sets_default_learning_values(): void
    {
        $abstractUser = Mockery::mock('Laravel\Socialite\Two\User');
        $abstractUser->shouldReceive('getId')->andReturn('github-67890');
        $abstractUser->shouldReceive('getEmail')->andReturn('github@example.com');
        $abstractUser->shouldReceive('getName')->andReturn('GitHub User');
        $abstractUser->shouldReceive('getNickname')->andReturn('githubuser');
        $abstractUser->shouldReceive('getAvatar')->andReturn('https://avatars.githubusercontent.com/photo.jpg');

        Socialite::shouldReceive('driver->stateless->user')
            ->once()
            ->andReturn($abstractUser);

        $this->get('/api/v1/auth/github/callback');

        $user = User::where('email', 'github@example.com')->first();
        $this->assertNotNull($user);
        $this->assertEquals(0, $user->current_streak);
        $this->assertEquals(0, $user->total_xp);
        $this->assertEquals(1, $user->level);
        $this->assertEquals('daily', $user->learning_goal);
        $this->assertEquals(10, $user->daily_goal_minutes);
    }

    public function test_oauth_callback_returns_token_in_redirect_url(): void
    {
        $abstractUser = Mockery::mock('Laravel\Socialite\Two\User');
        $abstractUser->shouldReceive('getId')->andReturn('google-new-user-123');
        $abstractUser->shouldReceive('getEmail')->andReturn('newuser@example.com');
        $abstractUser->shouldReceive('getName')->andReturn('New User');
        $abstractUser->shouldReceive('getNickname')->andReturn('newuser');
        $abstractUser->shouldReceive('getAvatar')->andReturn(null);

        Socialite::shouldReceive('driver->stateless->user')
            ->once()
            ->andReturn($abstractUser);

        $response = $this->get('/api/v1/auth/google/callback');
        $redirectUrl = $response->headers->get('Location');

        // Token should be in the URL
        $this->assertStringContainsString('token=', $redirectUrl);
    }

    public function test_oauth_callback_handles_provider_failure(): void
    {
        Socialite::shouldReceive('driver->stateless->user')
            ->once()
            ->andThrow(new \Exception('OAuth provider error'));

        $response = $this->getJson('/api/v1/auth/google/callback');

        $response->assertStatus(422)
            ->assertJson([
                'code' => 'E_OAUTH_001',
            ]);
    }

    // ======================================================================
    // OAuth users can authenticate via /me endpoint
    // ======================================================================

    public function test_oauth_user_can_access_protected_routes(): void
    {
        $abstractUser = Mockery::mock('Laravel\Socialite\Two\User');
        $abstractUser->shouldReceive('getId')->andReturn('google-oauth-me-123');
        $abstractUser->shouldReceive('getEmail')->andReturn('oauthme@example.com');
        $abstractUser->shouldReceive('getName')->andReturn('OAuth Me');
        $abstractUser->shouldReceive('getNickname')->andReturn('oauthme');
        $abstractUser->shouldReceive('getAvatar')->andReturn(null);

        Socialite::shouldReceive('driver->stateless->user')
            ->once()
            ->andReturn($abstractUser);

        // Get token from redirect URL
        $response = $this->get('/api/v1/auth/google/callback');
        $redirectUrl = $response->headers->get('Location');
        parse_str(parse_url($redirectUrl, PHP_URL_QUERY), $query);
        $token = $query['token'] ?? null;
        $this->assertNotNull($token, 'Token should be present in redirect URL');

        // Use token to access /me
        $meResponse = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/v1/auth/me');

        $meResponse->assertStatus(200)
            ->assertJsonPath('data.email', 'oauthme@example.com');
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }
}
