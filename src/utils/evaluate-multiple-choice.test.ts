import { describe, expect, it } from 'vitest'
import { evaluateMultipleChoice } from './evaluate-multiple-choice'

describe('evaluateMultipleChoice', () => {
  it('accepts single correct answer', () => {
    const result = evaluateMultipleChoice(['a'], ['a'])
    expect(result).toEqual({ isCorrect: true, score: 1, maxScore: 1 })
  })

  it('rejects wrong single answer', () => {
    const result = evaluateMultipleChoice(['b'], ['a'])
    expect(result.isCorrect).toBe(false)
    expect(result.score).toBe(0)
  })

  it('requires all correct ids for multi-select', () => {
    const result = evaluateMultipleChoice(['a', 'b'], ['a', 'b'], true)
    expect(result.isCorrect).toBe(true)
    expect(result.score).toBe(1)
  })

  it('gives partial credit for some correct multi-select', () => {
    const result = evaluateMultipleChoice(['a'], ['a', 'b'], true)
    expect(result.isCorrect).toBe(false)
    expect(result.score).toBe(0.5)
  })

  it('gives zero when wrong options outweigh hits', () => {
    const result = evaluateMultipleChoice(['a', 'c'], ['a', 'b'], true)
    expect(result.isCorrect).toBe(false)
    expect(result.score).toBe(0)
  })

  it('penalizes extra wrong selections in multi-select', () => {
    const result = evaluateMultipleChoice(['a', 'b', 'c'], ['a', 'b'], true)
    expect(result.isCorrect).toBe(false)
    expect(result.score).toBe(0.5)
  })
})
