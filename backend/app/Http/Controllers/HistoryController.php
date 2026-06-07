<?php

namespace App\Http\Controllers;

use App\Models\UserProgress;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class HistoryController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $progress = UserProgress::with(['lesson.topic'])
            ->where('user_id', $request->user()->id)
            ->whereNotNull('completed_at')
            ->orderBy('completed_at', 'desc')
            ->paginate(20);

        return response()->json([
            'data' => $progress->map(fn ($p) => [
                'id' => $p->id,
                'lesson_id' => $p->lesson_id,
                'lesson_name' => $p->lesson?->name,
                'topic_name' => $p->lesson?->topic?->name,
                'topic_slug' => $p->lesson?->topic?->slug,
                'accuracy' => $p->best_score,
                'xp_earned' => $p->xp_earned,
                'time_seconds' => $p->time_seconds,
                'completed_at' => $p->completed_at?->toIso8601String(),
            ]),
        ]);
    }
}
