import { env } from '@/lib/env'

export async function streamGeneration(
  systemPrompt: string,
  userPrompt: string,
  onDelta: (delta: string) => void,
): Promise<string> {
  // Ollama (local) takes priority — free, no quota
  try {
    const { streamWithOllama } = await import('./ollama')
    return await streamWithOllama(systemPrompt, userPrompt, onDelta)
  } catch (ollamaErr) {
    console.warn('[provider] Ollama unavailable, trying cloud fallbacks:', (ollamaErr as Error).message)
  }

  if (env.GEMINI_API_KEY) {
    const { streamWithGemini } = await import('./gemini')
    return streamWithGemini(systemPrompt, userPrompt, onDelta)
  }

  try {
    const { streamWithClaude } = await import('./claude')
    return await streamWithClaude(systemPrompt, userPrompt, onDelta)
  } catch (err: unknown) {
    const status = (err as { status?: number })?.status
    if ((status === 529 || status === 500 || status === 400) && env.OPENAI_API_KEY) {
      const { streamWithOpenAI } = await import('./openai')
      return streamWithOpenAI(systemPrompt, userPrompt, onDelta)
    }
    throw err
  }
}
