import { describe, expect, it } from 'vitest'
import { topicFromQuery } from '@/content/topics'

describe('topicFromQuery', () => {
  it('узнаёт темы платформы по русским формулировкам', () => {
    expect(topicFromQuery('структура промпта')).toBe('struktura-prompta')
    expect(topicFromQuery('что такое галлюцинации LLM')).toBe('galjucinacii')
    expect(topicFromQuery('токены и как работают модели')).toBe('kak-rabotayut-llm')
  })
})
