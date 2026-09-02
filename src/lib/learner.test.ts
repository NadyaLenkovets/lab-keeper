import { describe, expect, it } from 'vitest'
import { compactLearnerSummary, deriveLevel, loadLearner } from '@/lib/learner'
import type { TopicStats } from '@/lib/learner'

const emptyTopic = (): TopicStats => ({
  mistakes: [],
  timeSpentSec: 0,
  level: 'none',
})

describe('compactLearnerSummary', () => {
  it('собирает короткий профиль без сырого лога', () => {
    const text = compactLearnerSummary(loadLearner())
    expect(text).toContain('Как работают LLM')
    expect(text).toContain('Галлюцинации')
    expect(text.length).toBeLessThan(1200)
  })
})

describe('уровень темы', () => {
  it('считает weak / developing / strong по процентам', () => {
    expect(deriveLevel(emptyTopic())).toBe('none')
    expect(deriveLevel({ ...emptyTopic(), testPercent: 40 })).toBe('weak')
    expect(deriveLevel({ ...emptyTopic(), testPercent: 60 })).toBe('developing')
    expect(deriveLevel({ ...emptyTopic(), testPercent: 90 })).toBe('strong')
  })
})
