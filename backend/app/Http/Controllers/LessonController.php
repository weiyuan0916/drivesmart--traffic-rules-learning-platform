<?php

namespace App\Http\Controllers;

use App\Models\Lesson;
use App\Models\UserClipProgress;
use App\Models\UserProgress;
use Illuminate\Http\JsonResponse;

class LessonController extends Controller
{
    public function index(): JsonResponse
    {
        $lessons = Lesson::with('topic')
            ->orderBy('order_index')
            ->get();

        return response()->json([
            'data' => $lessons->map(fn ($l) => $l->toApiArray()),
        ]);
    }

    public function show(string $id): JsonResponse
    {
        $lesson = Lesson::with(['topic', 'clips'])->findOrFail($id);

        return response()->json([
            'data' => $lesson->toApiArray(),
        ]);
    }

    public function resetProgress(string $id): JsonResponse
    {
        $user = auth()->user();
        $lesson = Lesson::with('clips')->findOrFail($id);
        $clipIds = $lesson->clips->pluck('id')->toArray();

        // Delete user clip progress for all clips in this lesson
        UserClipProgress::where('user_id', $user->id)
            ->whereIn('clip_id', $clipIds)
            ->delete();

        // Delete user lesson progress for this lesson
        UserProgress::where('user_id', $user->id)
            ->where('lesson_id', $lesson->id)
            ->delete();

        return response()->json([
            'data' => [
                'lesson_id' => $lesson->id,
                'progress_cleared' => true,
            ],
        ]);
    }
}
