import type { GenerationOutput } from '@/types/generation'

export function parseGenerationResponse(raw: string): GenerationOutput {
  let cleaned = raw.trim()
  // Strip <think>...</think> blocks (Qwen and other reasoning models)
  cleaned = cleaned.replace(/<think>[\s\S]*?<\/think>/g, '').trim()
  // Strip markdown fences
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
  }
  // Extract first JSON object if there's surrounding text
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/)
  if (jsonMatch) cleaned = jsonMatch[0]
  return JSON.parse(cleaned) as GenerationOutput
}
