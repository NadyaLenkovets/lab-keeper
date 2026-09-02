import type { ExerciseConfig } from '../types/exercise'
import type { ActivityConfig } from '../types/activity'
import { isBuildTheBridgeActivity, isFreeTextActivity } from '../types/activity'

export function exerciseToSearchText(config: ExerciseConfig): string {
  const parts = [config.prompt]
  switch (config.type) {
    case 'singleChoice':
    case 'multipleChoice':
      parts.push(config.options.map((o) => o.label).join('; '))
      parts.push(`Правильно: ${config.correctOptionIds.join(', ')}`)
      parts.push(config.explanation.correct)
      break
    case 'trueFalse':
      parts.push(`Верный ответ: ${config.correctAnswer ? 'верно' : 'неверно'}`)
      parts.push(config.explanation.correct)
      break
    case 'fillTheBlank':
      parts.push(
        config.blanks
          .map((b) => b.correctAnswers.join('/'))
          .join(', '),
      )
      parts.push(config.explanation.correct)
      break
    case 'matchPairs':
      parts.push(
        config.pairs
          .map((p) => `${p.leftLabel} — ${p.rightLabel}`)
          .join('; '),
      )
      parts.push(config.explanation.correct)
      break
    case 'orderSteps':
      parts.push(config.steps.map((s) => s.label).join(' → '))
      parts.push(config.explanation.correct)
      break
    case 'promptBuilder':
      parts.push(config.slots.map((s) => `${s.title}: ${s.hint}`).join('; '))
      parts.push(config.blocks.map((b) => b.label).join('; '))
      parts.push(config.explanation.correct)
      break
    case 'spotTheHallucination':
      parts.push(config.segments.map((s) => s.text).join(' '))
      parts.push(config.explanation.correct)
      break
    case 'failureModePicker':
      parts.push(config.weakPrompt)
      parts.push(config.options.map((o) => o.label).join('; '))
      parts.push(config.explanation.correct)
      break
  }
  return parts.filter(Boolean).join('\n')
}

export function activityToSearchText(activity: ActivityConfig): string {
  if (isFreeTextActivity(activity)) {
    return [
      activity.prompt,
      activity.concept,
      activity.modelAnswer,
      activity.rubric.join('; '),
    ].join('\n')
  }
  if (isBuildTheBridgeActivity(activity)) {
    return [
      activity.prompt,
      `Связь: ${activity.conceptA} и ${activity.conceptB}`,
      activity.modelAnswer,
    ].join('\n')
  }
  return exerciseToSearchText(activity)
}
