import type { ExerciseResult } from '@/types/exercise'

export type ResultStatus = 'correct' | 'partial' | 'incorrect'

export function getResultStatus(result: ExerciseResult): ResultStatus {
  if (result.maxScore <= 0) return 'incorrect'
  const ratio = result.score / result.maxScore
  if (ratio >= 1) return 'correct'
  if (ratio > 0) return 'partial'
  return 'incorrect'
}

export const exerciseTypeLabels: Record<
  import('@/types/exercise').ExerciseConfig['type'],
  string
> = {
  singleChoice: 'Один ответ',
  multipleChoice: 'Несколько ответов',
  trueFalse: 'Верно / неверно',
  fillTheBlank: 'Заполнить пропуск',
  matchPairs: 'Сопоставить пары',
  orderSteps: 'Расставить шаги',
  promptBuilder: 'Собрать промпт',
  spotTheHallucination: 'Найти галлюцинацию',
  failureModePicker: 'Режимы сбоя',
}
