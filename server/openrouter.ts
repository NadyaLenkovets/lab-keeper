/** Проверка, что модель бесплатная (openrouter/free или *:free). */
export function resolveFreeModel(raw: string | undefined): string {
  const model = (raw ?? 'openrouter/free').trim() || 'openrouter/free'
  if (model === 'openrouter/free') return model
  if (model.endsWith(':free')) return model
  throw new Error(
    `Модель «${model}» не бесплатная. Используйте openrouter/free или slug с суффиксом :free`,
  )
}

export function getOpenRouterConfig() {
  const apiKey = process.env.OPENROUTER_API_KEY?.trim() ?? ''
  const model = resolveFreeModel(process.env.OPENROUTER_MODEL)
  return { apiKey, model, configured: Boolean(apiKey) }
}

export type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string }

export type OpenRouterResult = {
  content: string
  status: number
}

export async function chatCompletion(
  messages: ChatMessage[],
  options?: { temperature?: number; timeoutMs?: number },
): Promise<OpenRouterResult> {
  const { apiKey, model, configured } = getOpenRouterConfig()
  if (!configured) {
    const err = new Error('OPENROUTER_API_KEY не задан на сервере') as Error & {
      status: number
    }
    err.status = 401
    throw err
  }

  const controller = new AbortController()
  const timeoutMs = options?.timeoutMs ?? 90_000
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:5173',
        'X-Title': 'Lab Keeper',
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: options?.temperature ?? 0.4,
      }),
      signal: controller.signal,
    })

    const rawText = await res.text()
    if (!res.ok) {
      const err = new Error(
        res.status === 429
          ? 'Лимит OpenRouter (rate limit). Подождите или откройте demo.'
          : `OpenRouter ошибка ${res.status}: ${rawText.slice(0, 240)}`,
      ) as Error & { status: number }
      err.status = res.status
      throw err
    }

    let parsed: {
      choices?: Array<{ message?: { content?: string } }>
    }
    try {
      parsed = JSON.parse(rawText) as typeof parsed
    } catch {
      throw new Error('OpenRouter вернул не-JSON ответ')
    }

    const content = parsed.choices?.[0]?.message?.content?.trim() ?? ''
    if (!content) throw new Error('Пустой ответ модели')
    return { content, status: res.status }
  } finally {
    clearTimeout(timer)
  }
}
