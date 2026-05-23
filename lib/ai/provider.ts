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
    try {
      const { streamWithGemini } = await import('./gemini')
      return await streamWithGemini(systemPrompt, userPrompt, onDelta)
    } catch (geminiErr) {
      console.warn('[provider] Gemini failed, trying next fallback:', (geminiErr as Error).message)
    }
  }

  if (env.ANTHROPIC_API_KEY) {
    try {
      const { streamWithClaude } = await import('./claude')
      return await streamWithClaude(systemPrompt, userPrompt, onDelta)
    } catch (claudeErr) {
      console.warn('[provider] Claude failed, trying next fallback:', (claudeErr as Error).message)
    }
  }

  if (env.OPENAI_API_KEY) {
    const { streamWithOpenAI } = await import('./openai')
    return streamWithOpenAI(systemPrompt, userPrompt, onDelta)
  }

  throw new Error('No AI provider available. Configure at least one of: OLLAMA, GEMINI_API_KEY, ANTHROPIC_API_KEY, OPENAI_API_KEY')
}
