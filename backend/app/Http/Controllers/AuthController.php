<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Illuminate\Validation\Rules\Password;

class AuthController extends Controller
{
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'string', 'min:8', 'confirmed', Password::defaults()],
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => $validated['password'],
            'timezone' => $request->input('timezone', 'Asia/Ho_Chi_Minh'),
            'learning_goal' => $request->input('learning_goal', 'daily'),
            'daily_goal_minutes' => $request->input('daily_goal_minutes', 10),
            'current_streak' => 0,
            'longest_streak' => 0,
            'total_xp' => 0,
            'level' => 1,
        ]);

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'data' => [
                'user' => $user->toApiArray(),
                'token' => $token,
                'token_type' => 'Bearer',
            ],
        ], 201);
    }

    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            return response()->json([
                'code' => 'E_AUTH_001',
                'message' => 'Thông tin đăng nhập không hợp lệ.',
            ], 401);
        }

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'data' => [
                'user' => $user->toApiArray(),
                'token' => $token,
                'token_type' => 'Bearer',
            ],
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Đăng xuất thành công.',
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'data' => $request->user()->toApiArray(),
        ]);
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'avatar_url' => ['sometimes', 'nullable', 'url'],
            'learning_goal' => ['sometimes', 'in:ielts,toeic,daily,business'],
            'timezone' => ['sometimes', 'string'],
            'daily_goal_minutes' => ['sometimes', 'integer', 'min:5', 'max:60'],
            'onboarding_completed' => ['sometimes', 'boolean'],
        ]);

        $request->user()->update($validated);

        return response()->json([
            'data' => $request->user()->toApiArray(),
        ]);
    }
}
