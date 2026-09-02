import { describe, expect, it } from 'vitest'
import type { SingleChoiceExerciseConfig } from '@/types/exercise'
import { mapExerciseResultToActivity } from '@/utils/map-activity-result'

describe('mapExerciseResultToActivity', () => {
  const activity: SingleChoiceExerciseConfig = {
    id: 'x',
    type: 'singleChoice',
    prompt: 'p',
    options: [
      { id: 'a', label: 'A' },
      { id: 'b', label: 'B' },
    ],
    correctOptionIds: ['a'],
    explanation: { correct: 'ok', incorrect: 'no' },
  }

  it('мапит correct', () => {
    const mapped = mapExerciseResultToActivity(
      {
        exerciseId: 'x',
        isCorrect: true,
        score: 1,
        maxScore: 1,
        userAnswer: { selectedOptionIds: ['a'] },
      },
      activity,
    )
    expect(mapped.status).toBe('correct')
    expect(mapped.feedback).toBe('ok')
    expect(mapped.activityId).toBe('x')
  })

  it('мапит partial', () => {
    const mapped = mapExerciseResultToActivity(
      {
        exerciseId: 'x',
        isCorrect: false,
        score: 0.5,
        maxScore: 1,
        userAnswer: {},
      },
      activity,
    )
    expect(mapped.status).toBe('partial')
  })
})
