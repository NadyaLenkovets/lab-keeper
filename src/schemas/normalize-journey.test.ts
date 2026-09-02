import { describe, expect, it } from 'vitest'
import { normalizeJourneyPayload, asArray } from '../../server/normalize-journey'
import { safeParseJourney } from '@/schemas/journey'

describe('normalizeJourneyPayload', () => {
  it('asArray: object → [] or wrapped', () => {
    expect(asArray({})).toEqual([])
    expect(asArray({ 0: 'a', 1: 'b' })).toEqual(['a', 'b'])
    expect(asArray('x')).toEqual(['x'])
  })

  it('чинит dependsOn-объект, options-map и обёртку journey', () => {
    const raw = {
      journey: {
        title: 'Тест',
        sourceSummary: 'Резюме',
        checkpoints: {
          0: {
            id: 'cp-1',
            title: 'Блок',
            concept: 'Концепт',
            dependsOn: {},
            difficulty: '1',
            timeLimitSec: '120',
            activities: [
              {
                id: 'a1',
                type: 'singleChoice',
                prompt: 'Вопрос?',
                options: { a: 'Да', b: 'Нет' },
                correctOptionIds: 'a',
              },
              {
                id: 'a2',
                type: 'freeResponse',
                prompt: 'Объясни',
                rubric: 'смысл',
                modelAnswer: 'Ответ',
                keywords: 'смысл',
              },
            ],
          },
        },
      },
    }

    const normalized = normalizeJourneyPayload(raw)
    const parsed = safeParseJourney(normalized)
    expect(parsed.success).toBe(true)
    if (parsed.success) {
      expect(parsed.data.checkpoints[0].dependsOn).toEqual([])
      const sc = parsed.data.checkpoints[0].activities[0]
      expect(sc.type).toBe('singleChoice')
      if (sc.type === 'singleChoice') {
        expect(sc.options).toHaveLength(2)
        expect(sc.correctOptionIds).toEqual(['a'])
        expect(sc.explanation.correct).toBeTruthy()
      }
    }
  })

  it('мапит алиасы типов активностей', () => {
    const raw = {
      title: 'Т',
      sourceSummary: 'С',
      createdAt: '2026-01-01T00:00:00.000Z',
      checkpoints: [
        {
          id: 'cp-1',
          title: 'Б',
          concept: 'К',
          dependsOn: [],
          difficulty: 1,
          timeLimitSec: 120,
          activities: [
            {
              id: 'a1',
              type: 'single_choice',
              prompt: '?',
              options: [
                { id: 'a', label: '1' },
                { id: 'b', label: '2' },
              ],
              correctOptionIds: ['a'],
              explanation: { correct: 'ok', incorrect: 'no' },
            },
            {
              id: 'a2',
              type: 'eli5',
              prompt: 'Объясни',
              rubric: ['a'],
              modelAnswer: 'x',
              keywords: ['y'],
            },
          ],
        },
      ],
    }
    const parsed = safeParseJourney(normalizeJourneyPayload(raw))
    expect(parsed.success).toBe(true)
    if (parsed.success) {
      expect(parsed.data.checkpoints[0].activities[0].type).toBe('singleChoice')
      expect(parsed.data.checkpoints[0].activities[1].type).toBe(
        'explainLikeImFive',
      )
    }
  })
})
