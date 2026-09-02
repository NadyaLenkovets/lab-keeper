import { chunkJourney } from '../../src/content/chunk-journey.ts'
import { topicFromQuery } from '../../src/content/topics.ts'
import type { Journey } from '../../src/types/journey.ts'
import type { TopicId } from '../../src/types/rag.ts'
import { upsertJourneyOverlay } from '../../src/utils/merge-journey-overlay.ts'
import { embedTexts, getEmbeddingModel } from './embed.ts'
import { loadAiOverlay, writeAiOverlay } from './overlay.ts'

export async function ingestGeneratedJourney(input: {
  journey: Journey
  query: string
}): Promise<{ chunkCount: number; withVectors: number; topicId: TopicId }> {
  const topicId = topicFromQuery(input.query)
  const drafts = chunkJourney(input.journey, 'ai', topicId)
  let embeddings: number[][] | null = null
  try {
    embeddings = await embedTexts(drafts.map((chunk) => `${chunk.title}\n${chunk.text}`))
  } catch (err) {
    console.warn('[rag] journey embed failed, lexical chunks only:', err)
  }

  const chunks = drafts.map((chunk, i) => ({
    ...chunk,
    embedding: embeddings?.[i],
  }))

  const overlay = upsertJourneyOverlay(loadAiOverlay(true), {
    journey: input.journey,
    topicId,
    chunks,
    model: embeddings?.length ? getEmbeddingModel() : null,
  })
  writeAiOverlay(overlay)

  return {
    chunkCount: chunks.length,
    withVectors: chunks.filter((chunk) => (chunk.embedding?.length ?? 0) > 0).length,
    topicId,
  }
}
