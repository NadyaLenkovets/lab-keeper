import { describe, expect, it } from 'vitest'
import { getResultStatus } from './get-result-status'

describe('getResultStatus', () => {
  it('returns correct for full score', () => {
    expect(
      getResultStatus({
        exerciseId: 'a',
        isCorrect: true,
        score: 1,
        maxScore: 1,
        userAnswer: null,
      }),
    ).toBe('correct')
  })

  it('returns partial for fractional score', () => {
    expect(
      getResultStatus({
        exerciseId: 'a',
        isCorrect: false,
        score: 0.5,
        maxScore: 1,
        userAnswer: null,
      }),
    ).toBe('partial')
  })

  it('returns incorrect for zero score', () => {
    expect(
      getResultStatus({
        exerciseId: 'a',
        isCorrect: false,
        score: 0,
        maxScore: 1,
        userAnswer: null,
      }),
    ).toBe('incorrect')
  })
})
