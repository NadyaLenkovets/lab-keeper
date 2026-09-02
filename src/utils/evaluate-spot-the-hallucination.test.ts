import { describe, expect, it } from 'vitest'
import { evaluateSpotTheHallucination } from './evaluate-spot-the-hallucination'

describe('evaluateSpotTheHallucination', () => {
  it('returns full score when all hallucinations found', () => {
    const result = evaluateSpotTheHallucination(['h1', 'h2'], ['h1', 'h2'])
    expect(result).toEqual({ isCorrect: true, score: 1, maxScore: 1 })
  })

  it('gives partial credit for one of two', () => {
    const result = evaluateSpotTheHallucination(['h1'], ['h1', 'h2'])
    expect(result.score).toBe(0.5)
  })

  it('penalizes wrong selections', () => {
    const result = evaluateSpotTheHallucination(['h1', 'ok1'], ['h1', 'h2'])
    expect(result.score).toBe(0)
  })
})
