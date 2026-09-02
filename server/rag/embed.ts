import { getOpenRouterConfig } from '../openrouter.ts'

const BATCH_SIZE = 16

export function getEmbeddingModel(): string {
  return process.env.OPENROUTER_EMBEDDING_MODEL?.trim() || 'openai/text-embedding-3-small'
}

async function embedBatch(texts: string[]): Promise<number[][]> {
  const { apiKey, configured } = getOpenRouterConfig()
  if (!configured) {
    throw new Error('OPENROUTER_API_KEY не задан — эмбеддинги недоступны')
  }

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
    throw new Error(`Embeddings ${res.status}: ${raw.slice(0, 400)}`)
  }
  const parsed = JSON.parse(raw) as {
    data?: Array<{ embedding: number[]; index: number }>
  }
  const rows = parsed.data ?? []
  if (rows.length !== texts.length) {
    throw new Error(
      `Embeddings: ожидали ${texts.length} векторов, получили ${rows.length}`,
    )
  }
  return rows
    .sort((a, b) => a.index - b.index)
    .map((row) => row.embedding)
}

export async function embedTexts(texts: string[]): Promise<number[][] | null> {
  if (texts.length === 0) return []
  const { configured } = getOpenRouterConfig()
  if (!configured) return null

  const all: number[][] = []
  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE)
    const part = await embedBatch(batch)
    all.push(...part)
    console.log(`[embed] ${Math.min(i + BATCH_SIZE, texts.length)}/${texts.length}`)
  }
  return all
}
