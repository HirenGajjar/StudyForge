'use client'
import { useEffect, useState } from 'react'
import { generateAnonToken } from '@/lib/utils/format'

const KEY = 'studyforge_anon_token'

export function useAnonymousSession() {
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    let t = localStorage.getItem(KEY)
    if (!t) {
      t = generateAnonToken()
      localStorage.setItem(KEY, t)
    }
    setToken(t)
  }, [])

  return token
}
