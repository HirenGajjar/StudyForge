import OpenAI from 'openai'
import { env } from '@/lib/env'

export async function streamWithOpenAI(
  systemPrompt: string,
  userPrompt: string,
  onDelta: (delta: string) => void,
): Promise<string> {
  const client = new OpenAI({ apiKey: env.OPENAI_API_KEY })
  const stream = await client.chat.completions.create({
    model: 'gpt-4o',
    max_tokens: 16000,
    stream: true,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
  })

  let full = ''
  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta?.content ?? ''
    if (delta) {
      full += delta
      onDelta(delta)
    }
  }
  return full
}
