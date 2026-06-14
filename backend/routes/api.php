<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\BbcController;
use App\Http\Controllers\HistoryController;
use App\Http\Controllers\LessonController;
use App\Http\Controllers\ListeningController;
use App\Http\Controllers\ProgressController;
use App\Http\Controllers\SocialAuthController;
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

    // OAuth — Redirect to provider
    Route::get('/{provider}/redirect', [SocialAuthController::class, 'redirect'])
        ->where('provider', 'google|github');

    // OAuth — Callback from provider
    Route::get('/{provider}/callback', [SocialAuthController::class, 'callback'])
        ->where('provider', 'google|github');
});

// ============================================================
// BBC Learning English — Public routes (no auth required)
// index() and show() don't need auth; only user-specific
// data (progress, notes, vocabulary) requires authentication.
// ============================================================
Route::prefix('v1/listening/bbc')->group(function () {
    Route::get('/', [BbcController::class, 'index']);
    Route::get('/{slug}', [BbcController::class, 'show'])->where('slug', '[a-z0-9\-]+');
    // Dictation GET — public (viewing lesson dictation content doesn't require auth)
    Route::get('/{id}/dictation', [BbcController::class, 'getDictation'])->where('id', '[0-9]+');
    Route::get('/{id}/dictation/summary', [BbcController::class, 'getDictationSummary'])->where('id', '[0-9]+');
});

// ============================================================
// API v1 — /api/v1/*
// ============================================================

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

    // BBC Learning English — User-specific routes (auth required)
    Route::prefix('listening/bbc')->group(function () {
        Route::get('/dashboard', [BbcController::class, 'dashboard']);
        Route::post('/{id}/progress', [BbcController::class, 'updateProgress'])->where('id', '[0-9]+');
        Route::post('/{id}/complete', [BbcController::class, 'complete'])->where('id', '[0-9]+');
        Route::get('/{id}/notes', [BbcController::class, 'getNotes'])->where('id', '[0-9]+');
        Route::put('/{id}/notes', [BbcController::class, 'updateNotes'])->where('id', '[0-9]+');
        Route::get('/{id}/vocabulary', [BbcController::class, 'getVocabulary'])->where('id', '[0-9]+');
        Route::post('/{id}/vocabulary', [BbcController::class, 'saveVocabulary'])->where('id', '[0-9]+');
        Route::put('/{id}/vocabulary/{vocabularyId}', [BbcController::class, 'updateVocabulary'])->where(['id' => '[0-9]+', 'vocabularyId' => '[0-9]+']);
        Route::delete('/{id}/vocabulary/{vocabularyId}', [BbcController::class, 'deleteVocabulary'])->where(['id' => '[0-9]+', 'vocabularyId' => '[0-9]+']);

        // Dictation routes — GET public, POST requires auth
        Route::post('/{id}/dictation/segments', [BbcController::class, 'submitSegment'])->where('id', '[0-9]+');
        Route::post('/{id}/dictation/complete', [BbcController::class, 'completeDictation'])->where('id', '[0-9]+');
    });
});
