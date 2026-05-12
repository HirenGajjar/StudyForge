import { cleanText, truncateChunk } from '@/lib/utils/chunk-text'
import type { ParsedChunk } from './pdf-parser'

export async function parseDocx(buffer: Buffer, isPastPaper = false): Promise<ParsedChunk[]> {
  const mammoth = await import('mammoth')
  const result = await mammoth.extractRawText({ buffer })
  const text = result.value

  const sections = text.split(/\n{2,}/).filter((s) => s.trim().length > 20)
  const chunkSize = 1500
  const chunks: ParsedChunk[] = []

  let current = ''
  let idx = 0

  for (const section of sections) {
    if ((current + '\n\n' + section).split(/\s+/).length > chunkSize) {
      if (current.trim()) {
        const cleaned = cleanText(truncateChunk(current))
        chunks.push({
          chunkIndex: idx++,
          chunkType: 'page',
          content: cleaned,
          metadata: {
            has_image: cleaned.length < 80,
            is_past_paper: isPastPaper,
            word_count: cleaned.split(/\s+/).filter(Boolean).length,
          },
        })
      }
      current = section
    } else {
      current = current ? current + '\n\n' + section : section
    }
  }

  if (current.trim()) {
    const cleaned = cleanText(truncateChunk(current))
    chunks.push({
      chunkIndex: idx,
      chunkType: 'page',
      content: cleaned,
      metadata: {
        has_image: false,
        is_past_paper: isPastPaper,
        word_count: cleaned.split(/\s+/).filter(Boolean).length,
      },
    })
  }

  return chunks
}
