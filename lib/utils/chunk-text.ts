export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4)
}

export function cleanText(raw: string): string {
  return raw
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .replace(/​|‌|‍|﻿/g, '')
    .replace(/ {2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .normalize('NFC')
    .trim()
}

export function truncateChunk(text: string, maxChars = 8000): string {
  if (text.length <= maxChars) return text
  const cut = text.lastIndexOf('\n\n', maxChars)
  return cut > maxChars * 0.6 ? text.slice(0, cut) : text.slice(0, maxChars)
}

export interface ScoredChunk {
  content: string
  chunkIndex: number
  totalChunks: number
  isPastPaper: boolean
}

export function selectChunksWithinBudget(
  chunks: ScoredChunk[],
  maxTokens: number,
): ScoredChunk[] {
  const pastPaper = chunks.filter((c) => c.isPastPaper)
  const regular = chunks.filter((c) => !c.isPastPaper)

  const selected: ScoredChunk[] = [...pastPaper]
  let used = estimateTokens(pastPaper.map((c) => c.content).join(' '))

  // Include chunks in order — even sampling across the full document
  // gives better coverage than density-sorting which skips middle content
  for (const chunk of regular) {
    const t = estimateTokens(chunk.content)
    if (used + t > maxTokens) break
    selected.push(chunk)
    used += t
  }

  return selected.sort((a, b) => a.chunkIndex - b.chunkIndex)
}
