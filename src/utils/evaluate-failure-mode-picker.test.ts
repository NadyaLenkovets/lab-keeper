import { describe, expect, it } from 'vitest'
import { evaluateFailureModePicker } from './evaluate-failure-mode-picker'

describe('evaluateFailureModePicker', () => {
  it('returns full score when all failure modes selected', () => {
    const result = evaluateFailureModePicker(['a', 'b'], ['a', 'b'])
    expect(result).toEqual({ isCorrect: true, score: 1, maxScore: 1 })
  })

  it('gives partial credit for some correct modes', () => {
    const result = evaluateFailureModePicker(['a'], ['a', 'b'])
    expect(result.score).toBe(0.5)
    expect(result.isCorrect).toBe(false)
  })

  it('penalizes wrong selections', () => {
    const result = evaluateFailureModePicker(['a', 'c'], ['a', 'b'])
    expect(result.score).toBe(0)
  })
})
