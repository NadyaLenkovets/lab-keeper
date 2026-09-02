import type { Journey } from '../types/journey'
import type { ContentOrigin, RagChunk, TopicId } from '../types/rag'
import { activityToSearchText } from './exercise-to-text'

export function chunkJourney(
  journey: Journey,
  origin: ContentOrigin,
  topicId: TopicId,
): Omit<RagChunk, 'embedding'>[] {
  const chunks: Omit<RagChunk, 'embedding'>[] = [
    {
      id: `journey:${journey.id}:summary`,
      sourceType: 'journey',
      origin,
      topicId,
      title: journey.title,
      sectionId: 'summary',
      url: `/journey/${journey.id}`,
      text: `${journey.title}\n${journey.sourceSummary}`,
    },
  ]
  for (const cp of journey.checkpoints) {
    const activityText = cp.activities.map(activityToSearchText).join('\n\n')
    chunks.push({
      id: `journey:${journey.id}:${cp.id}`,
      sourceType: 'journey',
      origin,
      topicId,
      title: `${journey.title} — ${cp.title}`,
      sectionId: cp.id,
      url: `/journey/${journey.id}`,
      text: `${cp.title}\nКонцепция: ${cp.concept}\n${activityText}`,
    })
  }
  return chunks
}
