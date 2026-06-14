// ============================================================
// BBC Store — VinaListen
// Zustand store for BBC workspace state
// ============================================================

import { create } from 'zustand'
import type { BbcVocabularyItem } from '../types/bbc'

type WorkspaceTab = 'notes' | 'vocabulary' | 'dictation'

interface BbcWorkspaceState {
  activeTab: WorkspaceTab
  setActiveTab: (tab: WorkspaceTab) => void

  // Notes state
  notes: string
  setNotes: (notes: string) => void
  notesDirty: boolean
  setNotesDirty: (dirty: boolean) => void

  // Vocabulary state
  vocabulary: BbcVocabularyItem[]
  setVocabulary: (items: BbcVocabularyItem[]) => void
  addVocabulary: (item: BbcVocabularyItem) => void
  updateVocabulary: (id: number, updates: Partial<BbcVocabularyItem>) => void
  removeVocabulary: (id: number) => void

  // Dictation state
  dictationText: string
  setDictationText: (text: string) => void
  dictationDirty: boolean
  setDictationDirty: (dirty: boolean) => void

  // Reset workspace for a new lesson
  reset: () => void
}

export const useBbcStore = create<BbcWorkspaceState>()((set) => ({
  activeTab: 'notes',

  setActiveTab: (tab) => set({ activeTab: tab }),

  // Notes
  notes: '',
  setNotes: (notes) => set({ notes, notesDirty: true }),
  notesDirty: false,
  setNotesDirty: (dirty) => set({ notesDirty: dirty }),

  // Vocabulary
  vocabulary: [],
  setVocabulary: (items) => set({ vocabulary: items }),
  addVocabulary: (item) =>
    set((state) => ({ vocabulary: [item, ...state.vocabulary] })),
  updateVocabulary: (id, updates) =>
    set((state) => ({
      vocabulary: state.vocabulary.map((v) =>
        v.id === id ? { ...v, ...updates } : v,
      ),
    })),
  removeVocabulary: (id) =>
    set((state) => ({
      vocabulary: state.vocabulary.filter((v) => v.id !== id),
    })),

  // Dictation
  dictationText: '',
  setDictationText: (text) => set({ dictationText: text, dictationDirty: true }),
  dictationDirty: false,
  setDictationDirty: (dirty) => set({ dictationDirty: dirty }),

  // Reset
  reset: () =>
    set({
      activeTab: 'notes',
      notes: '',
      notesDirty: false,
      vocabulary: [],
      dictationText: '',
      dictationDirty: false,
    }),
}))
