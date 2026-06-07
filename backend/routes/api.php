<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\HistoryController;
use App\Http\Controllers\LessonController;
use App\Http\Controllers\ListeningController;
use App\Http\Controllers\ProgressController;
use App\Http\Controllers\TopicController;
use Illuminate\Support\Facades\Route;

// Health check (no auth, no versioning — infrastructure only)
Route::get('/health', fn () => response()->json(['status' => 'ok', 'timestamp' => now()->toIso8601String()]));

// ============================================================
// API v1 — /api/v1/*
// ============================================================

// Public auth (no auth required)
Route::prefix('v1/auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
});

// Protected routes (require Bearer token)
Route::middleware('auth:sanctum')->prefix('v1')->group(function () {
    // Auth
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::patch('/auth/profile', [AuthController::class, 'updateProfile']);

    // Topics
    Route::get('/topics', [TopicController::class, 'index']);
    Route::get('/topics/{slug}', [TopicController::class, 'show']);

    // Lessons
    Route::get('/lessons', [LessonController::class, 'index']);
    Route::get('/lessons/{id}', [LessonController::class, 'show']);
    Route::delete('/lessons/{id}/progress', [LessonController::class, 'resetProgress']);

    // Listening / Scoring
    Route::post('/listening/check', [ListeningController::class, 'check']);

    // Progress
    Route::get('/progress/dashboard', [ProgressController::class, 'dashboard']);
    Route::get('/progress/weekly', [ProgressController::class, 'weekly']);

    // History
    Route::get('/history', [HistoryController::class, 'index']);
});
