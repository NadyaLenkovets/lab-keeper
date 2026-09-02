import type { RagChunk } from '@/types/rag'
import { rankChunks } from '@/utils/rank-chunks'

function chunk(id: string, text: string, embedding?: number[]): RagChunk {
  return {
    id,
    sourceType: 'article',
    origin: 'human',
    topicId: 'galjucinacii',
    title: id,
    sectionId: id,
    url: '/article/galjucinacii',
    text,
    embedding,
  }
}

describe('rankChunks', () => {
  it('при векторах поднимает семантически близкий чанк выше лексического совпадения', () => {
    const queryVec = [1, 0]
    const hits = rankChunks('zzz', queryVec, [
      chunk('lex', 'zzz полностью совпадает по словам, но вектор другой', [0, 1]),
      chunk('sem', 'про галлюцинации модели без слова zzz', [0.99, 0.01]),
    ], 2)
    expect(hits[0]?.chunk.id).toBe('sem')
    expect(hits[0]?.score).toBeGreaterThan(hits[1]?.score ?? 0)
  })
})
