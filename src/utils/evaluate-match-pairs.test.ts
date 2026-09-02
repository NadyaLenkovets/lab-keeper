import { describe, expect, it } from 'vitest'
import { evaluateMatchPairs } from './evaluate-match-pairs'

const pairs = [
  { leftId: 'l1', leftLabel: 'A', rightId: 'r1', rightLabel: '1' },
  { leftId: 'l2', leftLabel: 'B', rightId: 'r2', rightLabel: '2' },
]

describe('evaluateMatchPairs', () => {
  it('returns full score when all pairs match', () => {
    const result = evaluateMatchPairs({ l1: 'r1', l2: 'r2' }, pairs)
    expect(result).toEqual({ isCorrect: true, score: 1, maxScore: 1 })
  })

  it('gives partial credit for some correct pairs', () => {
    const result = evaluateMatchPairs({ l1: 'r1', l2: 'r1' }, pairs)
    expect(result.isCorrect).toBe(false)
    expect(result.score).toBe(0.5)
  })

  it('returns zero when nothing matches', () => {
    const result = evaluateMatchPairs({ l1: 'r2', l2: 'r1' }, pairs)
    expect(result.score).toBe(0)
  })
})
