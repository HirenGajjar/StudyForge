'use client'
import { create } from 'zustand'
import type { NoteSection, ExpectedQuestion, QuizQuestion } from '@/types/generation'

type GenerationStatus = 'idle' | 'uploading' | 'parsing' | 'searching' | 'generating' | 'complete' | 'error'

interface GenerationStore {
  status: GenerationStatus
  statusMessage: string
  progress: number
  rawBuffer: string
  loadedSessionId: string | null
  sections: NoteSection[]
  expectedQuestions: ExpectedQuestion[]
  quizTitle: string
  quizQuestions: QuizQuestion[]
  error: string | null

  setStatus: (s: GenerationStatus, msg?: string, progress?: number) => void
  setLoadedSessionId: (id: string) => void
  appendDelta: (delta: string) => void
  setSections: (s: NoteSection[]) => void
  setExpectedQuestions: (q: ExpectedQuestion[]) => void
  setQuiz: (title: string, questions: QuizQuestion[]) => void
  setError: (msg: string) => void
  reset: () => void
}

export const useGenerationStore = create<GenerationStore>((set) => ({
  status: 'idle',
  statusMessage: '',
  progress: 0,
  rawBuffer: '',
  loadedSessionId: null,
  sections: [],
  expectedQuestions: [],
  quizTitle: '',
  quizQuestions: [],
  error: null,

  setStatus: (status, statusMessage = '', progress = 0) => set({ status, statusMessage, progress }),
  setLoadedSessionId: (loadedSessionId) => set({ loadedSessionId }),
  appendDelta: (delta) => set((s) => ({ rawBuffer: s.rawBuffer + delta })),
  setSections: (sections) => set({ sections }),
  setExpectedQuestions: (expectedQuestions) => set({ expectedQuestions }),
  setQuiz: (quizTitle, quizQuestions) => set({ quizTitle, quizQuestions }),
  setError: (error) => set({ error, status: 'error' }),
  // reset clears loadedSessionId so the next session always starts fresh
  reset: () => set({
    status: 'idle', statusMessage: '', progress: 0, rawBuffer: '',
    loadedSessionId: null,
    sections: [], expectedQuestions: [], quizTitle: '', quizQuestions: [], error: null,
  }),
}))
