'use client'
import { create } from 'zustand'

interface QuizStore {
  currentIndex: number
  answers: Record<string, string>
  submitted: boolean
  score: number | null

  setAnswer: (questionId: string, answer: string) => void
  nextQuestion: () => void
  prevQuestion: () => void
  submit: (score: number) => void
  reset: () => void
}

export const useQuizStore = create<QuizStore>((set) => ({
  currentIndex: 0,
  answers: {},
  submitted: false,
  score: null,

  setAnswer: (questionId, answer) =>
    set((s) => ({ answers: { ...s.answers, [questionId]: answer } })),
  nextQuestion: () => set((s) => ({ currentIndex: s.currentIndex + 1 })),
  prevQuestion: () => set((s) => ({ currentIndex: Math.max(0, s.currentIndex - 1) })),
  submit: (score) => set({ submitted: true, score }),
  reset: () => set({ currentIndex: 0, answers: {}, submitted: false, score: null }),
}))
