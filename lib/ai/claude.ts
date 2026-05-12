import Anthropic from '@anthropic-ai/sdk'
import { env } from '@/lib/env'

const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY })

export async function streamWithClaude(
  systemPrompt: string,
  userPrompt: string,
  onDelta: (delta: string) => void,
): Promise<string> {
  const stream = await client.messages.stream({
    model: 'claude-sonnet-4-5',
    max_tokens: 16000,
    system: [
      {
        type: 'text',
        text: systemPrompt,
        cache_control: { type: 'ephemeral' },
      },
    ],
    messages: [{ role: 'user', content: userPrompt }],
  })

  let full = ''
  for await (const chunk of stream) {
    if (
      chunk.type === 'content_block_delta' &&
      chunk.delta.type === 'text_delta'
    ) {
      const text = chunk.delta.text
      full += text
      onDelta(text)
    }
  }
  return full
}
