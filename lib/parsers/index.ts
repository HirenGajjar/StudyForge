import type { ParsedChunk } from './pdf-parser'

export type SupportedFileType = 'pdf' | 'pptx' | 'ppt' | 'docx'

export function detectFileType(fileName: string): SupportedFileType | null {
  const ext = fileName.split('.').pop()?.toLowerCase()
  if (ext === 'pdf') return 'pdf'
  if (ext === 'pptx' || ext === 'ppt') return 'pptx'
  if (ext === 'docx') return 'docx'
  return null
}

export async function parseFile(
  buffer: Buffer,
  fileType: SupportedFileType,
  isPastPaper = false,
): Promise<ParsedChunk[]> {
  switch (fileType) {
    case 'pdf': {
      const { parsePdf } = await import('./pdf-parser')
      return parsePdf(buffer, isPastPaper)
    }
    case 'pptx':
    case 'ppt': {
      const { parsePptx } = await import('./pptx-parser')
      return parsePptx(buffer, isPastPaper)
    }
    case 'docx': {
      const { parseDocx } = await import('./docx-parser')
      return parseDocx(buffer, isPastPaper)
    }
  }
}

export type { ParsedChunk }
