import { LEARNING_TOPICS, TOPIC_LABELS } from '@/content/topics'
import type { TopicId } from '@/types/rag'

const STORAGE_KEY = 'lab-keeper-learner'

export type TopicLevel = 'none' | 'weak' | 'developing' | 'strong'

export type TopicMistake = {
  exerciseId: string
  prompt: string
}

export type TopicStats = {
  articleOpenedAt?: string
  testPercent?: number
  testCompletedAt?: string
  journeyPercent?: number
  journeyCompletedAt?: string
  mistakes: TopicMistake[]
  timeSpentSec: number
  level: TopicLevel
}

export type LearnerProfile = {
  version: 1
  topics: Record<TopicId, TopicStats>
  recentAsk: string[]
  updatedAt: string
}

function emptyTopic(): TopicStats {
  return { mistakes: [], timeSpentSec: 0, level: 'none' }
}

function emptyProfile(): LearnerProfile {
  return {
    version: 1,
    topics: {
      'kak-rabotayut-llm': emptyTopic(),
      galjucinacii: emptyTopic(),
      'struktura-prompta': emptyTopic(),
      general: emptyTopic(),
    },
    recentAsk: [],
    updatedAt: new Date().toISOString(),
  }
}

export function deriveLevel(topic: TopicStats): TopicLevel {
  const scores = [topic.testPercent, topic.journeyPercent].filter(
    (n): n is number => typeof n === 'number',
  )
  if (scores.length === 0) return topic.articleOpenedAt ? 'developing' : 'none'
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length
  if (avg >= 80) return 'strong'
  if (avg >= 50) return 'developing'
  return 'weak'
}

export function loadLearner(): LearnerProfile {
  if (typeof localStorage === 'undefined') return emptyProfile()
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return emptyProfile()
  try {
    const parsed = JSON.parse(raw) as LearnerProfile
    const base = emptyProfile()
    return {
      ...base,
      ...parsed,
      version: 1,
      topics: { ...base.topics, ...parsed.topics },
      recentAsk: parsed.recentAsk ?? [],
    }
  } catch {
    return emptyProfile()
  }
}

export function saveLearner(profile: LearnerProfile): void {
  const next = { ...profile, updatedAt: new Date().toISOString() }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
}

export function clearLearner(): void {
  localStorage.removeItem(STORAGE_KEY)
}

export function exportLearner(): string {
  return JSON.stringify(loadLearner(), null, 2)
}

function updateTopic(
  topicId: TopicId,
  patch: (topic: TopicStats) => TopicStats,
): LearnerProfile {
  const profile = loadLearner()
  const topic = patch({ ...emptyTopic(), ...profile.topics[topicId] })
  topic.level = deriveLevel(topic)
  profile.topics[topicId] = topic
  saveLearner(profile)
  return profile
}

export function recordArticleOpen(topicId: TopicId): void {
  if (topicId === 'general') return
  updateTopic(topicId, (topic) => ({
    ...topic,
    articleOpenedAt: topic.articleOpenedAt ?? new Date().toISOString(),
  }))
}

export function recordTestAttempt(input: {
  topicId: TopicId
  percent: number
  timeSpentSec: number
  mistakes: TopicMistake[]
}): void {
  if (input.topicId === 'general') return
  updateTopic(input.topicId, (topic) => ({
    ...topic,
    testPercent: input.percent,
    testCompletedAt: new Date().toISOString(),
    timeSpentSec: topic.timeSpentSec + Math.max(0, input.timeSpentSec),
    mistakes: input.mistakes.slice(0, 8),
  }))
}

export function recordJourneyAttempt(input: {
  topicId: TopicId
  percent: number
  timeSpentSec?: number
}): void {
  if (input.topicId === 'general') return
  updateTopic(input.topicId, (topic) => ({
    ...topic,
    journeyPercent: input.percent,
    journeyCompletedAt: new Date().toISOString(),
    timeSpentSec: topic.timeSpentSec + Math.max(0, input.timeSpentSec ?? 0),
  }))
}

export function recordAskQuestion(question: string): void {
  const profile = loadLearner()
  profile.recentAsk = [question, ...profile.recentAsk].slice(0, 8)
  saveLearner(profile)
}

export function compactLearnerSummary(profile: LearnerProfile = loadLearner()): string {
  const lines = LEARNING_TOPICS.map((id) => {
    const t = profile.topics[id]
    const mistakes = t.mistakes
      .slice(0, 3)
      .map((m) => m.prompt.slice(0, 80))
      .join('; ')
    return `- ${TOPIC_LABELS[id]}: уровень ${t.level}, тест ${t.testPercent ?? '—'}%, journey ${t.journeyPercent ?? '—'}%, время ~${Math.round(t.timeSpentSec / 60)} мин${mistakes ? `, ошибки: ${mistakes}` : ''}`
  })
  const asks = profile.recentAsk.slice(0, 3)
  if (asks.length > 0) {
    lines.push(`Недавние вопросы: ${asks.join(' | ')}`)
  }
  return lines.join('\n')
}
