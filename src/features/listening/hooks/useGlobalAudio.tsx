// ============================================================
// useGlobalAudio — VinaListen
// Global audio manager to ensure only one audio plays at a time
// ============================================================

import { createContext, useContext, useRef, useCallback, ReactNode } from 'react'

interface AudioController {
  pause: () => void
  play: () => Promise<void>
  setSrc: (src: string) => void
}

interface GlobalAudioContextValue {
  registerAudio: (controller: AudioController) => () => void
  pauseAllOthers: (except?: AudioController) => void
}

const GlobalAudioContext = createContext<GlobalAudioContextValue | null>(null)

export function GlobalAudioProvider({ children }: { children: ReactNode }) {
  const activeAudioRef = useRef<AudioController | null>(null)
  const allAudioRef = useRef<Set<AudioController>>(new Set())

  const registerAudio = useCallback((controller: AudioController) => {
    allAudioRef.current.add(controller)
    return () => {
      allAudioRef.current.delete(controller)
      if (activeAudioRef.current === controller) {
        activeAudioRef.current = null
      }
    }
  }, [])

  const pauseAllOthers = useCallback((except?: AudioController) => {
    allAudioRef.current.forEach((audio) => {
      if (audio !== except) {
        audio.pause()
      }
    })
    if (except) {
      activeAudioRef.current = except
    }
  }, [])

  return (
    <GlobalAudioContext.Provider value={{ registerAudio, pauseAllOthers }}>
      {children}
    </GlobalAudioContext.Provider>
  )
}

export function useGlobalAudio() {
  const context = useContext(GlobalAudioContext)
  if (!context) {
    throw new Error('useGlobalAudio must be used within a GlobalAudioProvider')
  }
  return context
}

// Helper hook for components using useAudioPlayer
export function useAudioExclusivity(audioController: AudioController | null) {
  const { registerAudio, pauseAllOthers } = useGlobalAudio()

  const controllerRef = useRef(audioController)
  controllerRef.current = audioController

  return { registerAudio, pauseAllOthers }
}