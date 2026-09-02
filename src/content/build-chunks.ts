import type { Article, ArticleBlock } from '@/types/article'
import type { ExerciseConfig } from '@/types/exercise'
import type { Journey } from '@/types/journey'
import type { ContentOrigin, RagChunk, TopicId } from '@/types/rag'
import { testsIndex } from '@/content/tests-index'
import { exerciseToSearchText, activityToSearchText } from '@/content/exercise-to-text'
import { topicFromExerciseId, topicFromSlug } from '@/content/topics'

function flushSection(
  chunks: Omit<RagChunk, 'embedding'>[],
  article: Article,
  heading: string,
  sectionIndex: number,
  buffer: string[],
) {
  const text = buffer.join('\n\n').trim()
  if (!text) return
  chunks.push({
    id: `article:${article.slug}:s${sectionIndex}`,
    sourceType: 'article',
    origin: 'human',
    topicId: topicFromSlug(article.slug),
    title: heading ? `${article.title} — ${heading}` : article.title,
    sectionId: `s${sectionIndex}`,
    url: `/article/${article.slug}`,
    text,
  })
}

export function chunkArticle(article: Article): Omit<RagChunk, 'embedding'>[] {
  const chunks: Omit<RagChunk, 'embedding'>[] = []
  let heading = ''
  let sectionIndex = 0
  let buffer: string[] = []

  const startNewSection = (nextHeading: string) => {
    flushSection(chunks, article, heading, sectionIndex, buffer)
    sectionIndex += 1
    heading = nextHeading
    buffer = []
  }

  for (const block of article.blocks) {
    if (block.type === 'heading') {
      startNewSection(block.text)
      continue
    }
    if (block.type === 'exercise') continue
    const piece = blockToText(block)
    if (piece) buffer.push(piece)
  }
  flushSection(chunks, article, heading, sectionIndex, buffer)
  return chunks
}

function blockToText(block: ArticleBlock): string {
  switch (block.type) {
    case 'paragraph':
    case 'callout':
      return block.text
    case 'list':
      return block.items.map((item, i) => `${i + 1}. ${item}`).join('\n')
    default:
      return ''
  }
}

export function chunkExercise(
  config: ExerciseConfig,
  kind: 'exercise' | 'test',
): Omit<RagChunk, 'embedding'> {
  const topicId = topicFromExerciseId(config.id)
  const inTest = testsIndex.find((t) => t.exerciseIds.includes(config.id))
  const url = inTest ? `/tests/${inTest.slug}` : `/article/${topicId === 'general' ? '' : topicId}`
  return {
    id: `${kind}:${config.id}`,
    sourceType: kind,
    origin: 'human',
    topicId,
    title: `${kind === 'test' ? 'Тест' : 'Упражнение'}: ${config.prompt.slice(0, 80)}`,
    sectionId: config.id,
    url: url || '/main',
    text: exerciseToSearchText(config),
  }
}

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

export function buildAllChunks(input: {
  articles: Article[]
  exercises: ExerciseConfig[]
  journeys: Array<{ journey: Journey; origin: ContentOrigin; topicId: TopicId }>
}): Omit<RagChunk, 'embedding'>[] {
  const testIds = new Set(testsIndex.flatMap((t) => t.exerciseIds))
  const chunks: Omit<RagChunk, 'embedding'>[] = []
  for (const article of input.articles) {
    chunks.push(...chunkArticle(article))
  }
  for (const exercise of input.exercises) {
    chunks.push(chunkExercise(exercise, testIds.has(exercise.id) ? 'test' : 'exercise'))
  }
  for (const item of input.journeys) {
    chunks.push(...chunkJourney(item.journey, item.origin, item.topicId))
  }
  return chunks
}
