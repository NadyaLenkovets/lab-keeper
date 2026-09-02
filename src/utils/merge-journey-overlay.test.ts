import { describe, expect, it } from 'vitest'
import { chunkJourney } from '@/content/chunk-journey'
import type { Journey } from '@/types/journey'
import {
  combineIndexChunks,
  emptyAiOverlay,
  upsertJourneyOverlay,
} from '@/utils/merge-journey-overlay'

const sampleJourney = (id: string, title: string): Journey => ({
  id,
  title,
  sourceSummary: `${title}: краткое содержание маршрута.`,
  createdAt: '2026-09-02T00:00:00.000Z',
  origin: 'ai',
  checkpoints: [
    {
      id: 'cp-1',
      title: 'Блок 1',
      concept: title,
      dependsOn: [],
      difficulty: 1,
      timeLimitSec: 60,
      activities: [
        {
          id: `${id}-fr`,
          type: 'freeResponse',
          prompt: 'Объясните тему своими словами',
          concept: title,
          rubric: ['Упоминает суть темы'],
          modelAnswer: 'Краткий верный ответ.',
          keywords: ['тема'],
        },
      ],
    },
  ],
})

describe('upsertJourneyOverlay', () => {
  it('добавляет чанки origin=ai и заменяет повтор с тем же id', () => {
    const first = sampleJourney('kj-1', 'Структура промпта')
    const chunks = chunkJourney(first, 'ai', 'struktura-prompta').map((chunk) => ({
      ...chunk,
    }))
    const once = upsertJourneyOverlay(emptyAiOverlay(), {
      journey: first,
      topicId: 'struktura-prompta',
      chunks,
      model: 'openai/text-embedding-3-small',
    })
    expect(once.chunks.every((c) => c.origin === 'ai')).toBe(true)
    expect(once.chunks.every((c) => c.id.startsWith('journey:kj-1:'))).toBe(true)
    expect(once.journeys).toHaveLength(1)

    const updated = sampleJourney('kj-1', 'Структура промпта — v2')
    const nextChunks = chunkJourney(updated, 'ai', 'struktura-prompta')
    const twice = upsertJourneyOverlay(once, {
      journey: updated,
      topicId: 'struktura-prompta',
      chunks: nextChunks,
      model: 'openai/text-embedding-3-small',
    })
    expect(twice.journeys).toHaveLength(1)
    expect(twice.chunks.filter((c) => c.id.startsWith('journey:kj-1:'))).toHaveLength(
      nextChunks.length,
    )
    expect(twice.chunks.some((c) => c.title.includes('v2'))).toBe(true)
  })
})

describe('combineIndexChunks', () => {
  it('overlay перекрывает статический чанк с тем же id', () => {
    const base = chunkJourney(sampleJourney('demo', 'Demo'), 'demo', 'galjucinacii')
    const overlay = chunkJourney(sampleJourney('demo', 'AI demo'), 'ai', 'galjucinacii')
    const combined = combineIndexChunks(base, overlay)
    expect(combined.filter((c) => c.id === 'journey:demo:summary')).toHaveLength(1)
    expect(combined.find((c) => c.id === 'journey:demo:summary')?.origin).toBe('ai')
  })
})
