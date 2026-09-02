import { describe, expect, it } from 'vitest'
import { calculateScore } from './calculate-score'

describe('calculateScore', () => {
  it('returns zeros for empty', () => {
    expect(calculateScore([])).toEqual({
      totalQuestions: 0,
      correctCount: 0,
      percent: 0,
      totalScore: 0,
      maxScore: 0,
    })
  })

  it('calculates percent from partial scores', () => {
    const summary = calculateScore([
      { exerciseId: 'a', isCorrect: true, score: 1, maxScore: 1, userAnswer: null },
      { exerciseId: 'b', isCorrect: false, score: 0, maxScore: 1, userAnswer: null },
      { exerciseId: 'c', isCorrect: false, score: 0.5, maxScore: 1, userAnswer: null },
    ])
    expect(summary.correctCount).toBe(1)
    expect(summary.percent).toBe(50)
  })
})
