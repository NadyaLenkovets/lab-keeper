import { describe, expect, it } from 'vitest'
import { evaluateTrueFalse } from './evaluate-true-false'

describe('evaluateTrueFalse', () => {
  it('scores correct boolean', () => {
    expect(evaluateTrueFalse(true, true).isCorrect).toBe(true)
  })

  it('scores incorrect boolean', () => {
    expect(evaluateTrueFalse(false, true).isCorrect).toBe(false)
  })

  it('treats null as unanswered', () => {
    expect(evaluateTrueFalse(null, true).score).toBe(0)
  })
})
