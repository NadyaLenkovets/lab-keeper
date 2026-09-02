import { loadRagIndex } from '../server/rag/load-index.ts'
import { rankChunks } from '../src/utils/rank-chunks.ts'

const index = loadRagIndex(true)
const withVectors = index.chunks.filter((c) => (c.embedding?.length ?? 0) > 0).length
console.log(
  `index model=${index.model} chunks=${index.chunks.length} vectors=${withVectors} dim=${index.chunks[0]?.embedding?.length}`,
)

const probe = index.chunks.find((c) => c.id.includes('galjucinacii') && c.embedding)
if (!probe?.embedding) {
  throw new Error('Нет чанка галлюцинаций с вектором')
}

const hits = rankChunks('probe', probe.embedding, index.chunks, 5)
for (const hit of hits) {
  console.log(
    `${hit.score.toFixed(3)} ${hit.chunk.sourceType} ${hit.chunk.url} ${hit.chunk.title.slice(0, 80)}`,
  )
}
if (!hits.some((h) => h.chunk.topicId === 'galjucinacii')) {
  throw new Error('cosine не вернул чанки темы галлюцинаций')
}
console.log('cosine ok')

