import { describe, expect, it } from 'vitest'
import { evaluateFillTheBlank } from './evaluate-fill-the-blank'

describe('evaluateFillTheBlank', () => {
  it('accepts normalized match', () => {
    const result = evaluateFillTheBlank(
      { a: '  Токен  ' },
      [{ id: 'a', correctAnswers: ['токен'] }],
    )
    expect(result.isCorrect).toBe(true)
  })

  it('supports partial score', () => {
    const result = evaluateFillTheBlank(
      { a: 'да', b: 'нет' },
      [
        { id: 'a', correctAnswers: ['да'] },
        { id: 'b', correctAnswers: ['контекст'] },
      ],
    )
    expect(result.isCorrect).toBe(false)
    expect(result.score).toBe(0.5)
  })
})
