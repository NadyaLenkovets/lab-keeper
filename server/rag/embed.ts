import { getOpenRouterConfig } from '../openrouter.ts'

export function getEmbeddingModel(): string {
  return process.env.OPENROUTER_EMBEDDING_MODEL?.trim() || 'openai/text-embedding-3-small'
}

export async function embedTexts(texts: string[]): Promise<number[][] | null> {
  const { apiKey, configured } = getOpenRouterConfig()
  if (!configured || texts.length === 0) return null

  const res = await fetch('https://openrouter.ai/api/v1/embeddings', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'http://localhost:5173',
      'X-Title': 'Lab Keeper',
    },
    body: JSON.stringify({
      model: getEmbeddingModel(),
      input: texts,
    }),
  })

  const raw = await res.text()
  if (!res.ok) {
    throw new Error(`Embeddings ${res.status}: ${raw.slice(0, 240)}`)
  }
  const parsed = JSON.parse(raw) as {
    data?: Array<{ embedding: number[]; index: number }>
  }
  const rows = parsed.data ?? []
  return rows
    .sort((a, b) => a.index - b.index)
    .map((row) => row.embedding)
}
