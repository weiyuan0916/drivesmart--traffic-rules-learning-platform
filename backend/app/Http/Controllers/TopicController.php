<?php

namespace App\Http\Controllers;

use App\Models\Topic;
use Illuminate\Http\JsonResponse;

class TopicController extends Controller
{
    public function index(): JsonResponse
    {
        $topics = Topic::where('is_active', true)
            ->orderBy('order_index')
            ->get();

        return response()->json([
            'data' => $topics->map(fn ($t) => $t->toApiArray()),
        ]);
    }

    public function show(string $slug): JsonResponse
    {
        $topic = Topic::where('slug', $slug)
            ->where('is_active', true)
            ->firstOrFail();

        return response()->json([
            'data' => $topic->toApiArray(),
        ]);
    }
}
