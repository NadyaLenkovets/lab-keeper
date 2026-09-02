import { describe, expect, it } from 'vitest'
import type { FlatActivityStep } from '@/types/journey'
import {
  createJourneyRunState,
  journeyRunReducer,
} from '@/utils/journey-run-reducer'

function makeSteps(): FlatActivityStep[] {
  return [
    {
      flatIndex: 0,
      checkpointIndex: 0,
      activityIndex: 0,
      checkpoint: {
        id: 'c0',
        title: 'A',
        concept: 'A',
        dependsOn: [],
        difficulty: 1,
        timeLimitSec: 60,
        activities: [],
      },
      activity: {
        id: 'a1',
        type: 'trueFalse',
        prompt: 'p',
        correctAnswer: true,
        explanation: { correct: 'y', incorrect: 'n' },
      },
    },
    {
      flatIndex: 1,
      checkpointIndex: 0,
      activityIndex: 1,
      checkpoint: {
        id: 'c0',
        title: 'A',
        concept: 'A',
        dependsOn: [],
        difficulty: 1,
        timeLimitSec: 60,
        activities: [],
      },
      activity: {
        id: 'a2',
        type: 'trueFalse',
        prompt: 'p2',
        correctAnswer: false,
        explanation: { correct: 'y', incorrect: 'n' },
      },
    },
    {
      flatIndex: 2,
      checkpointIndex: 1,
      activityIndex: 0,
      checkpoint: {
        id: 'c1',
        title: 'B',
        concept: 'B',
        dependsOn: [],
        difficulty: 1,
        timeLimitSec: 60,
        activities: [],
      },
      activity: {
        id: 'b1',
        type: 'trueFalse',
        prompt: 'p3',
        correctAnswer: true,
        explanation: { correct: 'y', incorrect: 'n' },
      },
    },
  ]
}

describe('journeyRunReducer', () => {
  it('timeout закрывает остаток чекпоинта и переходит дальше', () => {
    const steps = makeSteps()
    let state = createJourneyRunState()
    state = journeyRunReducer(state, {
      type: 'result',
      steps,
      result: {
        activityId: 'a1',
        score: 1,
        maxScore: 1,
        status: 'correct',
        userAnswer: true,
      },
    })
    state = journeyRunReducer(state, { type: 'next', steps })
    expect(state.currentIndex).toBe(1)

    state = journeyRunReducer(state, { type: 'timeout', steps })
    expect(state.results.some((r) => r.activityId === 'a2' && r.status === 'timeout')).toBe(
      true,
    )
    expect(state.currentIndex).toBe(2)
    expect(state.game.unlockedAchievements).toContain('first-checkpoint')
  })
})
