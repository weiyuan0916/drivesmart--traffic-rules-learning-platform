<?php
// app/Http/Controllers/Api/ExplanationController.php
// Stub for backend implementation

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ExplanationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ExplanationController extends Controller
{
    public function __construct(private ExplanationService $service) {}

    public function show(Request $request, string $clipId): JsonResponse
    {
        $lang = $request->query('lang', 'vi');

        try {
            $result = $this->service->getExplanation((int) $clipId, $lang);
            return response()->json(['data' => $result['data']]);
        } catch (\InvalidArgumentException $e) {
            return response()->json([
                'error' => 'UNSUPPORTED_LANGUAGE',
                'message' => $e->getMessage(),
            ], 400);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'AI_SERVICE_UNAVAILABLE',
                'message' => 'Translation service unavailable',
                'retry_after' => 30,
            ], 503);
        }
    }
}