<?php
// app/Services/ExplanationService.php
// Stub for backend implementation

namespace App\Services;

use App\Models\LessonExplanation;
use App\Services\GeminiService;

class ExplanationService
{
    public function __construct(private GeminiService $gemini) {}

    public function getExplanation(int $clipId, string $lang): array
    {
        $supported = ['vi', 'en', 'ja', 'zh', 'ko', 'fr'];
        if (!in_array($lang, $supported)) {
            throw new \InvalidArgumentException("Unsupported language: $lang");
        }

        // 1. Return cached translation
        $cached = LessonExplanation::where('clip_id', $clipId)
            ->where('language_code', $lang)
            ->first();

        if ($cached) {
            return ['data' => $cached, 'cached' => true];
        }

        // 2. AI translate via Gemini
        try {
            $result = $this->gemini->translateAndExplain($clipId, $lang);
            $explanation = LessonExplanation::create([
                'clip_id' => $clipId,
                'language_code' => $lang,
                'explanation' => $result['explanation'],
                'vocabulary_json' => json_encode($result['vocabulary']),
            ]);
            return ['data' => $explanation, 'cached' => false];
        } catch (\Exception $e) {
            // Fallback to Vietnamese if available
            $fallback = LessonExplanation::where('clip_id', $clipId)
                ->where('language_code', 'vi')->first();
            if ($fallback) {
                return ['data' => $fallback, 'cached' => true, 'fallback' => true];
            }
            throw $e;
        }
    }
}