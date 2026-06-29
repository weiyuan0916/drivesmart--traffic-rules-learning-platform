import { describe, it, expect, beforeEach } from 'vitest'
import { useBbcMicroDictationStore } from '@/features/listening/stores/bbcMicroDictationStore'

const MOCK_SESSION = {
  lesson: {
    id: 1,
    sourceId: 1,
    title: 'BBC 6 Minute English — Test Episode',
    slug: 'ep-test-001',
    sourceUrl: 'https://www.bbc.co.uk/learningenglish/english/features/6-minute-english/ep-test-001',
    thumbnailUrl: null,
    level: 'intermediate' as const,
    durationSeconds: 360,
    publishedAt: '2026-06-01T00:00:00Z',
    metadata: null,
    createdAt: '2026-06-01T00:00:00Z',
    updatedAt: '2026-06-01T00:00:00Z',
    progress: null,
  },
  hasSegments: true,
  segments: [
    { id: 0, text: 'Hello, this is BBC Learning English.', wordCount: 5, difficulty: 'easy' as const, estimatedDuration: 3, startTime: 0, endTime: 3 },
    { id: 1, text: "I'm Neil, and with me is Pippa.", wordCount: 7, difficulty: 'easy' as const, estimatedDuration: 4, startTime: 3, endTime: 7 },
    { id: 2, text: 'Today we discuss advertising.', wordCount: 4, difficulty: 'easy' as const, estimatedDuration: 2, startTime: 7, endTime: 9 },
  ],
  audioUrl: 'https://www.bbc.com/audio/play/test123',
  episodeCode: 'ep-test-001',
  segmentsSource: 'legacy_bbc' as const,
  requiresUserTranscript: true,
}

const MOCK_ATTEMPT_0 = {
  segmentIndex: 0,
  userInput: 'Hello, this is BBC Learning English.',
  timeSpentMs: 3000,
  score: {
    correct: ['hello', 'this', 'is', 'bbc', 'learning'],
    wrong: [],
    missing: ['english'],
    accuracy: 80.0,
    totalWords: 5,
    correctCount: 4,
    wrongCount: 0,
    missingCount: 1,
  },
}

describe('bbcMicroDictationStore', () => {
  beforeEach(() => {
    useBbcMicroDictationStore.getState().resetSession()
  })

  // TC-01: initSession sets lesson and currentIndex = 0
  it('initSession sets lesson and resets currentIndex to 0', () => {
    const store = useBbcMicroDictationStore.getState()

    store.initSession(MOCK_SESSION)

    const state = useBbcMicroDictationStore.getState()
    expect(state.lesson).toEqual(MOCK_SESSION)
    expect(state.currentIndex).toBe(0)
    expect(state.hasChecked).toBe(false)
    expect(state.isPlaying).toBe(false)
    expect(state.phase).toBe('intro')
  })

  // TC-02: submitAttempt saves attempt and sets hasChecked = true
  it('submitAttempt saves attempt and sets hasChecked', () => {
    const store = useBbcMicroDictationStore.getState()

    store.initSession(MOCK_SESSION)
    store.submitAttempt(MOCK_ATTEMPT_0)

    const state = useBbcMicroDictationStore.getState()
    expect(state.hasChecked).toBe(true)
    expect(state.phase).toBe('results')
    expect(state.isPlaying).toBe(false)
    expect(state.attempts[0]).toEqual(MOCK_ATTEMPT_0)
    expect(Object.keys(state.attempts)).toHaveLength(1)
  })

  // TC-03: setCurrentIndex advances and resets hasChecked
  it('setCurrentIndex advances index and resets hasChecked', () => {
    const store = useBbcMicroDictationStore.getState()

    store.initSession(MOCK_SESSION)
    store.submitAttempt(MOCK_ATTEMPT_0)
    expect(useBbcMicroDictationStore.getState().hasChecked).toBe(true)

    store.setCurrentIndex(1)

    const state = useBbcMicroDictationStore.getState()
    expect(state.currentIndex).toBe(1)
    expect(state.hasChecked).toBe(false)
    expect(state.phase).toBe('intro')
    expect(state.isPlaying).toBe(false)
  })

  // TC-04: resetSession clears all state
  it('resetSession clears all state', () => {
    const store = useBbcMicroDictationStore.getState()

    store.initSession(MOCK_SESSION)
    store.submitAttempt(MOCK_ATTEMPT_0)
    store.playSegment()

    store.resetSession()

    const state = useBbcMicroDictationStore.getState()
    expect(state.lesson).toBeNull()
    expect(state.currentIndex).toBe(0)
    expect(state.hasChecked).toBe(false)
    expect(state.isPlaying).toBe(false)
    expect(state.phase).toBe('intro')
    expect(state.attempts).toEqual([])
  })

  // TC-05: updateSettings updates partial settings
  it('updateSettings updates partial settings', () => {
    const store = useBbcMicroDictationStore.getState()

    store.updateSettings({ segmentLength: 10 })

    const state = useBbcMicroDictationStore.getState()
    expect(state.settings.segmentLength).toBe(10)
    expect(state.settings.playbackSpeed).toBe(1) // unchanged default

    store.updateSettings({ playbackSpeed: 0.75 })

    const state2 = useBbcMicroDictationStore.getState()
    expect(state2.settings.playbackSpeed).toBe(0.75)
    expect(state2.settings.segmentLength).toBe(10) // preserved
  })

  // TC-06: playSegment and pauseSegment toggle isPlaying
  it('playSegment and pauseSegment toggle isPlaying', () => {
    const store = useBbcMicroDictationStore.getState()

    store.initSession(MOCK_SESSION)
    expect(useBbcMicroDictationStore.getState().isPlaying).toBe(false)

    store.playSegment()
    expect(useBbcMicroDictationStore.getState().isPlaying).toBe(true)
    expect(useBbcMicroDictationStore.getState().phase).toBe('playing')

    store.pauseSegment()
    expect(useBbcMicroDictationStore.getState().isPlaying).toBe(false)
    expect(useBbcMicroDictationStore.getState().phase).toBe('input')
  })

  // TC-07: submitting attempts at different segment indices independently
  it('submits attempts at different segment indices independently', () => {
    const store = useBbcMicroDictationStore.getState()

    store.initSession(MOCK_SESSION)
    store.submitAttempt(MOCK_ATTEMPT_0)
    store.setCurrentIndex(1)
    store.submitAttempt({
      segmentIndex: 1,
      userInput: "I'm Neil, and with me is Pippa.",
      timeSpentMs: 4000,
      score: {
        correct: ["i'm", 'neil', 'and', 'with', 'me', 'is', 'pippa'],
        wrong: [],
        missing: [],
        accuracy: 100,
        totalWords: 7,
        correctCount: 7,
        wrongCount: 0,
        missingCount: 0,
      },
    })

    const state = useBbcMicroDictationStore.getState()
    expect(state.attempts[0]).toBeDefined()
    expect(state.attempts[1]).toBeDefined()
    expect(state.attempts[2]).toBeUndefined()
  })
})
