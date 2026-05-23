'use client'
import { useSyncExternalStore } from 'react'
import { generateAnonToken } from '@/lib/utils/format'

const KEY = 'studyforge_anon_token'

function getToken(): string {
  let t = localStorage.getItem(KEY)
  if (!t) {
    t = generateAnonToken()
    localStorage.setItem(KEY, t)
  }
  return t
}

export function useAnonymousSession(): string | null {
  return useSyncExternalStore(
    () => () => {},       // no external subscription needed
    () => getToken(),     // client snapshot
    () => null,           // server snapshot
  )
}
