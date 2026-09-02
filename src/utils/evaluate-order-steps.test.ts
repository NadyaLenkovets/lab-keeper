import { describe, expect, it } from 'vitest'
import { evaluateOrderSteps } from './evaluate-order-steps'

describe('evaluateOrderSteps', () => {
  it('returns full score for correct order', () => {
    const result = evaluateOrderSteps(['a', 'b', 'c'], ['a', 'b', 'c'])
    expect(result).toEqual({ isCorrect: true, score: 1, maxScore: 1 })
  })

  it('gives partial credit for some correct positions', () => {
    const result = evaluateOrderSteps(['a', 'c', 'b'], ['a', 'b', 'c'])
    expect(result.isCorrect).toBe(false)
    expect(result.score).toBeCloseTo(1 / 3)
  })

  it('returns zero for fully wrong order', () => {
    const result = evaluateOrderSteps(['c', 'b', 'a'], ['a', 'b', 'c'])
    expect(result.score).toBeCloseTo(1 / 3)
  })
})
