// ============================================================
// useLessonStateMachine — VinaListen
// State machine for lesson practice workflow
// ============================================================

import { useCallback } from 'react'
import { useLessonStore } from '../stores/lessonStore'
import type { LessonPracticeState } from '../types/lesson'

type StateTransition = {
  from: LessonPracticeState
  event: string
  to: LessonPracticeState
}

const TRANSITIONS: StateTransition[] = [
  { from: 'idle', event: 'play', to: 'playing' },
  { from: 'playing', event: 'clip_ended', to: 'ready_to_type' },
  { from: 'ready_to_type', event: 'start_typing', to: 'waiting_input' },
  { from: 'waiting_input', event: 'submit', to: 'checking' },
  { from: 'checking', event: 'result_received', to: 'showing_result' },
  { from: 'checking', event: 'error', to: 'waiting_input' },
  { from: 'showing_result', event: 'next_clip', to: 'idle' },
  { from: 'showing_result', event: 'prev_clip', to: 'idle' },
  { from: 'showing_result', event: 'retry_clip', to: 'idle' },
  { from: 'showing_result', event: 'lesson_complete', to: 'lesson_complete' },
  { from: 'idle', event: 'lesson_complete', to: 'lesson_complete' },
]

export function useLessonStateMachine() {
  const practiceState = useLessonStore((s) => s.practiceState)
  const setPracticeState = useLessonStore((s) => s.setPracticeState)

  const transition = useCallback(
    (event: string) => {
      const next = TRANSITIONS.find(
        (t) => t.from === practiceState && t.event === event,
      )
      if (next) {
        setPracticeState(next.to)
        return true
      }
      return false
    },
    [practiceState, setPracticeState],
  )

  const isInState = useCallback(
    (state: LessonPracticeState) => practiceState === state,
    [practiceState],
  )

  const canPlay = isInState('idle') || isInState('ready_to_type')
  const canSubmit = isInState('waiting_input')
  const canShowResult = isInState('showing_result')
  const canNavigate = isInState('showing_result') || isInState('ready_to_type')

  return {
    state: practiceState,
    transition,
    isInState,
    canPlay,
    canSubmit,
    canShowResult,
    canNavigate,
  }
}
