<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password;
use Laravel\Socialite\Facades\Socialite;

class SocialAuthController extends Controller
{
    /**
     * Redirect user to the OAuth provider's authentication page.
     */
    public function redirect(string $provider): JsonResponse
    {
        $this->validateProvider($provider);

        return response()->json([
            'data' => [
                'redirect_url' => Socialite::driver($provider)->stateless()->redirect()->getTargetUrl(),
            ],
        ]);
    }

    /**
     * Handle the OAuth callback from the provider.
     */
    public function callback(Request $request, string $provider)
    {
        $this->validateProvider($provider);

        try {
            $socialUser = Socialite::driver($provider)->stateless()->user();
        } catch (\Exception $e) {
            return response()->json([
                'code' => 'E_OAUTH_001',
                'message' => "{$provider} authentication failed. Please try again.",
            ], 422);
        }

        // Find or create user by provider + provider_id
        $user = User::where("{$provider}_id", $socialUser->getId())
            ->orWhere('email', $socialUser->getEmail())
            ->first();

        if (! $user) {
            $user = User::create([
                'name' => $socialUser->getName() ?? $socialUser->getNickname() ?? 'User',
                'email' => $socialUser->getEmail(),
                'avatar_url' => $socialUser->getAvatar(),
                "{$provider}_id" => $socialUser->getId(),
                'password' => Hash::make(Str::random(32)),
                'timezone' => 'Asia/Ho_Chi_Minh',
                'learning_goal' => 'daily',
                'daily_goal_minutes' => 10,
                'current_streak' => 0,
                'longest_streak' => 0,
                'total_xp' => 0,
                'level' => 1,
            ]);
        } else {
            // Update provider ID and avatar if changed
            if (empty($user->{"{$provider}_id"})) {
                $user->update([
                    "{$provider}_id" => $socialUser->getId(),
                    'avatar_url' => $socialUser->getAvatar(),
                ]);
            }
        }

        $token = $user->createToken('auth-token')->plainTextToken;

        // Redirect to frontend callback page with token and user data
        $frontendUrl = config('app.frontend_url', env('FRONTEND_URL', 'http://localhost:3000'));
        $userData = base64_encode(json_encode([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'avatar_url' => $user->avatar_url,
            'level' => $user->level,
            'total_xp' => $user->total_xp,
            'current_streak' => $user->current_streak,
            'longest_streak' => $user->longest_streak,
            'learning_goal' => $user->learning_goal,
            'timezone' => $user->timezone,
            'daily_goal_minutes' => $user->daily_goal_minutes,
            'onboarding_completed' => $user->onboarding_completed,
            'created_at' => $user->created_at?->toIso8601String(),
            'updated_at' => $user->updated_at?->toIso8601String(),
        ]));

        $callbackUrl = "{$frontendUrl}/auth/callback?token={$token}&user={$userData}";

        return response()->redirectTo($callbackUrl);
    }

    /**
     * Validate that the provider is supported.
     */
    protected function validateProvider(string $provider): void
    {
        $allowed = ['google', 'github'];

        if (! in_array($provider, $allowed)) {
            abort(404, "OAuth provider '{$provider}' is not supported.");
        }
    }
}
