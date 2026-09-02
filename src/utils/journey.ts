import type { ActivityConfig, ActivityResult } from '@/types/activity'
import type { FlatActivityStep, Journey } from '@/types/journey'
import { normalizeText } from '@/utils/normalize-text'

export function flattenJourney(journey: Journey): FlatActivityStep[] {
  const steps: FlatActivityStep[] = []
  let flatIndex = 0
  journey.checkpoints.forEach((checkpoint, checkpointIndex) => {
    checkpoint.activities.forEach((activity, activityIndex) => {
      steps.push({
        flatIndex,
        checkpointIndex,
        activityIndex,
        checkpoint,
        activity,
      })
      flatIndex += 1
    })
  })
  return steps
}

export function countActivities(journey: Journey): number {
  return journey.checkpoints.reduce(
    (sum, cp) => sum + cp.activities.length,
    0,
  )
}

/** Локальная оценка свободного ответа / bridge без AI (demo). */
export function gradeFreeLocally(
  activity: Extract<
    ActivityConfig,
    { keywords: string[]; modelAnswer: string; rubric: string[] }
  >,
  userAnswer: string,
): ActivityResult {
  const maxScore = 1
  const normalized = normalizeText(userAnswer)
  if (!normalized || normalized.length < 12) {
    return {
      activityId: activity.id,
      score: 0,
      maxScore,
      status: 'incorrect',
      userAnswer,
      feedback:
        'Ответ слишком короткий. Сформулируйте мысль полнее — опираясь на ключевые понятия темы.',
    }
  }

  const hit = activity.keywords.filter((kw) =>
    normalized.includes(normalizeText(kw)),
  )
  const ratio = hit.length / activity.keywords.length

  if (ratio >= 0.6) {
    return {
      activityId: activity.id,
      score: 1,
      maxScore,
      status: 'correct',
      userAnswer,
      feedback: `Хорошо: в ответе есть ${hit.join(', ')}. ${activity.rubric[0] ?? ''}`,
    }
  }

  if (ratio > 0) {
    const missing = activity.keywords.filter(
      (kw) => !normalized.includes(normalizeText(kw)),
    )
    return {
      activityId: activity.id,
      score: 0.5,
      maxScore,
      status: 'partial',
      userAnswer,
      feedback: `Частично верно: есть ${hit.join(', ')}. Не хватает: ${missing.slice(0, 3).join(', ')}.`,
    }
  }

  return {
    activityId: activity.id,
    score: 0,
    maxScore,
    status: 'incorrect',
    userAnswer,
    feedback: `Пока мимо ключевых идей. Ориентир: ${activity.modelAnswer.slice(0, 160)}…`,
  }
}

export function activityTypeLabel(type: ActivityConfig['type']): string {
  const labels: Record<ActivityConfig['type'], string> = {
    singleChoice: 'Один ответ',
    multipleChoice: 'Несколько ответов',
    trueFalse: 'Верно / неверно',
    fillTheBlank: 'Заполнить пропуск',
    matchPairs: 'Сопоставить пары',
    orderSteps: 'Расставить шаги',
    freeResponse: 'Свободный ответ',
    explainLikeImFive: 'Объясни просто',
    teachBack: 'Объясни другу',
    giveYourExample: 'Свой пример',
    buildTheBridge: 'Связь концепций',
  }
  return labels[type]
}
