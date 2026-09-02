import type { Journey } from '../types/journey'
import type { AiRagOverlayFile, RagChunk, TopicId } from '../types/rag'

export function emptyAiOverlay(): AiRagOverlayFile {
  return {
    version: 1,
    model: null,
    updatedAt: '',
    journeys: [],
    chunks: [],
  }
}

export function journeyChunkPrefix(journeyId: string): string {
  return `journey:${journeyId}:`
}

export function upsertJourneyOverlay(
  overlay: AiRagOverlayFile,
  input: {
    journey: Journey
    topicId: TopicId
    chunks: RagChunk[]
    model: string | null
  },
): AiRagOverlayFile {
  const prefix = journeyChunkPrefix(input.journey.id)
  return {
    version: 1,
    model: input.model ?? overlay.model,
    updatedAt: new Date().toISOString(),
    journeys: [
      ...overlay.journeys.filter((item) => item.journey.id !== input.journey.id),
      { topicId: input.topicId, journey: input.journey },
    ],
    chunks: [
      ...overlay.chunks.filter((chunk) => !chunk.id.startsWith(prefix)),
      ...input.chunks,
    ],
  }
}

export function combineIndexChunks(
  base: RagChunk[],
  overlayChunks: RagChunk[],
): RagChunk[] {
  const overlayIds = new Set(overlayChunks.map((chunk) => chunk.id))
  return [...base.filter((chunk) => !overlayIds.has(chunk.id)), ...overlayChunks]
}
