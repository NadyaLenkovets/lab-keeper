import type { ActivityConfig } from '@/types/activity'

const ACTIVITY_TYPE_LABELS: Record<ActivityConfig['type'], string> = {
  singleChoice: 'Один вариант',
  multipleChoice: 'Несколько вариантов',
  trueFalse: 'Верно / неверно',
  fillTheBlank: 'Пропуски',
  matchPairs: 'Пары',
  orderSteps: 'Порядок шагов',
  freeResponse: 'Свободный ответ',
  explainLikeImFive: 'Объясни просто',
  teachBack: 'Объясни другому',
  giveYourExample: 'Свой пример',
  buildTheBridge: 'Построй мост',
}

export function activityTypeLabel(type: ActivityConfig['type']): string {
  return ACTIVITY_TYPE_LABELS[type] ?? type
}

/** Человекочитаемый ответ из userAnswer разных типов упражнений. */
export function formatUserAnswer(userAnswer: unknown): string {
  if (userAnswer == null) return '—'
  if (typeof userAnswer === 'string') {
    const t = userAnswer.trim()
    return t.length > 0 ? t : '—'
  }
  if (typeof userAnswer === 'boolean') {
    return userAnswer ? 'Верно' : 'Неверно'
  }
  if (typeof userAnswer === 'number') return String(userAnswer)

  if (Array.isArray(userAnswer)) {
    if (userAnswer.length === 0) return '—'
    if (userAnswer.every((x) => typeof x === 'string')) {
      return userAnswer.join(' → ')
    }
    return userAnswer.map((x) => formatUserAnswer(x)).join(', ')
  }

  if (typeof userAnswer === 'object') {
    const o = userAnswer as Record<string, unknown>
    if (Array.isArray(o.selectedOptionIds)) {
      return (o.selectedOptionIds as unknown[])
        .map(String)
        .join(', ')
    }
    if (Array.isArray(o.selectedSpanIds)) {
      return (o.selectedSpanIds as unknown[]).map(String).join(', ')
    }
    // fill-the-blank: Record<blankId, string>
    const entries = Object.entries(o)
    if (
      entries.length > 0 &&
      entries.every(([, v]) => typeof v === 'string' || typeof v === 'number')
    ) {
      return entries.map(([k, v]) => `${k}: ${String(v)}`).join('; ')
    }
    // match-pairs: often Record<leftId, rightId>
    if (entries.length > 0) {
      return entries
        .map(([k, v]) => `${k} → ${formatUserAnswer(v)}`)
        .join('; ')
    }
  }

  try {
    return JSON.stringify(userAnswer)
  } catch {
    return '—'
  }
}
