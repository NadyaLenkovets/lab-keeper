import type { RagChunk } from '../types/rag'
import { cosineSimilarity } from './vector'

const STOP = new Set([
  'и', 'в', 'на', 'с', 'по', 'для', 'это', 'как', 'что', 'не', 'а', 'о', 'к',
  'из', 'у', 'за', 'от', 'же', 'но', 'да', 'или', 'то', 'ты', 'я', 'мы',
])

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-zа-яё0-9\s-]/gi, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 2 && !STOP.has(t))
}

export function lexicalScore(query: string, text: string): number {
  const q = new Set(tokenize(query))
  if (q.size === 0) return 0
  const doc = tokenize(text)
  if (doc.length === 0) return 0
  let hit = 0
  const docSet = new Set(doc)
  for (const token of q) {
    if (docSet.has(token)) hit += 1
  }
  return hit / q.size
}

export function rankChunks(
  query: string,
  queryEmbedding: number[] | null,
  chunks: RagChunk[],
  topK = 5,
): Array<{ chunk: RagChunk; score: number }> {
  const scored = chunks.map((chunk) => {
    const lex = lexicalScore(query, `${chunk.title}\n${chunk.text}`)
    if (!queryEmbedding || !chunk.embedding) {
      return { chunk, score: lex }
    }
    const vec = cosineSimilarity(queryEmbedding, chunk.embedding)
    return { chunk, score: vec * 0.75 + lex * 0.25 }
  })
  return scored
    .filter((h) => h.score > 0.08)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
}
