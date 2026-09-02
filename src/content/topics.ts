import type { TopicId } from '@/types/rag'

export const TOPIC_LABELS: Record<TopicId, string> = {
  'kak-rabotayut-llm': 'Как работают LLM',
  galjucinacii: 'Галлюцинации',
  'struktura-prompta': 'Структура промпта',
  general: 'Общее',
}

export const LEARNING_TOPICS: TopicId[] = [
  'kak-rabotayut-llm',
  'galjucinacii',
  'struktura-prompta',
]

export function topicFromSlug(slug: string): TopicId {
  if (slug.includes('galjucin') || slug.startsWith('hall-')) return 'galjucinacii'
  if (slug.includes('prompt') || slug.startsWith('prompt-')) return 'struktura-prompta'
  if (slug.includes('llm') || slug.startsWith('llm-')) return 'kak-rabotayut-llm'
  return 'general'
}

export function topicFromExerciseId(id: string): TopicId {
  if (id.startsWith('hall-')) return 'galjucinacii'
  if (id.startsWith('prompt-')) return 'struktura-prompta'
  if (id.startsWith('llm-')) return 'kak-rabotayut-llm'
  return 'general'
}
