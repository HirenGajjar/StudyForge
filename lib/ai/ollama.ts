async function callOllama(
  model: string,
  systemPrompt: string,
  userPrompt: string,
  onDelta: (delta: string) => void,
): Promise<string> {
  const ollamaBase = process.env.OLLAMA_BASE_URL ?? 'http://127.0.0.1:11434'
  const response = await fetch(`${ollamaBase}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    signal: AbortSignal.timeout(600_000), // 10 min — large models are slow to load
    body: JSON.stringify({
      model,
      stream: true,
      options: {
        num_ctx: 32768,     // safe for qwen2.5:14b — fits weights + KV cache in ~12GB
        num_predict: 16384, // max output tokens
        temperature: 0.4,
      },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    }),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Ollama error ${response.status}: ${text}`)
  }

  const reader = response.body!.getReader()
  const decoder = new TextDecoder()
  let full = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    const lines = decoder.decode(value).split('\n').filter(Boolean)
    for (const line of lines) {
      try {
        const json = JSON.parse(line)
        const delta = json.message?.content ?? ''
        if (delta) {
          full += delta
          onDelta(delta)
        }
      } catch {}
    }
  }

  return full
}

export async function streamWithOllama(
  systemPrompt: string,
  userPrompt: string,
  onDelta: (delta: string) => void,
): Promise<string> {
  const primary = process.env.OLLAMA_MODEL ?? 'qwen3:30b'
  const fallback = process.env.OLLAMA_FALLBACK_MODEL

  try {
    return await callOllama(primary, systemPrompt, userPrompt, onDelta)
  } catch (err) {
    if (fallback) {
      console.warn(`[ollama] Primary model "${primary}" failed, trying fallback "${fallback}":`, (err as Error).message)
      return await callOllama(fallback, systemPrompt, userPrompt, onDelta)
    }
    throw err
  }
}
