import { cleanText, truncateChunk } from '@/lib/utils/chunk-text'

export interface ParsedChunk {
  chunkIndex: number
  chunkType: 'page' | 'slide'
  content: string
  metadata: {
    title?: string
    has_image: boolean
    is_past_paper: boolean
    word_count: number
  }
}

export async function parsePdf(buffer: Buffer, isPastPaper = false): Promise<ParsedChunk[]> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const pdfParse = require('pdf-parse')
  const chunks: ParsedChunk[] = []

  await pdfParse(buffer, {
    pagerender(pageData: { getTextContent: () => Promise<{ items: Array<{ str: string }> }> }) {
      return pageData.getTextContent().then((textContent) => {
        const text = textContent.items.map((item) => item.str).join(' ')
        const cleaned = cleanText(truncateChunk(text))
        const words = cleaned.split(/\s+/).filter(Boolean)
        chunks.push({
          chunkIndex: chunks.length,
          chunkType: 'page',
          content: cleaned,
          metadata: {
            has_image: cleaned.length < 80,
            is_past_paper: isPastPaper,
            word_count: words.length,
          },
        })
        return text
      })
    },
  })

  return chunks
}
