import { describe, expect, it } from 'vitest'
import { evaluatePromptBuilder } from './evaluate-prompt-builder'

const slots = [
  { slotId: 'role', title: 'Роль', hint: '', correctBlockId: 'b-role' },
  { slotId: 'task', title: 'Задача', hint: '', correctBlockId: 'b-task' },
]

describe('evaluatePromptBuilder', () => {
  it('returns full score when all slots correct', () => {
    const result = evaluatePromptBuilder(
      { role: 'b-role', task: 'b-task' },
      slots,
    )
    expect(result).toEqual({ isCorrect: true, score: 1, maxScore: 1 })
  })

  it('gives partial credit for some correct slots', () => {
    const result = evaluatePromptBuilder({ role: 'b-role', task: 'b-wrong' }, slots)
    expect(result.score).toBe(0.5)
    expect(result.isCorrect).toBe(false)
  })
})
