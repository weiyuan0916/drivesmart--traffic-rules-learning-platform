<?php

namespace App\Http\Controllers;

use App\Services\ProgressService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProgressController extends Controller
{
    public function __construct(
        private ProgressService $progressService,
    ) {}

    public function dashboard(Request $request): JsonResponse
    {
        $stats = $this->progressService->getDashboard($request->user());

        return response()->json(['data' => $stats]);
    }

    public function weekly(Request $request): JsonResponse
    {
        $weekly = $this->progressService->getWeeklyActivity($request->user());

        return response()->json(['data' => $weekly]);
    }
}
