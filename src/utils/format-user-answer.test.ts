import { describe, expect, it } from 'vitest'
import { formatUserAnswer, activityTypeLabel } from '@/utils/format-user-answer'

describe('formatUserAnswer', () => {
  it('строка и boolean', () => {
    expect(formatUserAnswer('привет')).toBe('привет')
    expect(formatUserAnswer(true)).toBe('Верно')
    expect(formatUserAnswer(false)).toBe('Неверно')
    expect(formatUserAnswer(null)).toBe('—')
  })

  it('choice и порядок', () => {
    expect(
      formatUserAnswer({ selectedOptionIds: ['a', 'c'] }),
    ).toBe('a, c')
    expect(formatUserAnswer(['s1', 's2'])).toBe('s1 → s2')
  })
})

describe('activityTypeLabel', () => {
  it('локализует type', () => {
    expect(activityTypeLabel('buildTheBridge')).toBe('Построй мост')
  })
})
