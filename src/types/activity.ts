import type {
  ExerciseExplanation,
  FillTheBlankExerciseConfig,
  MatchPairsExerciseConfig,
  MultipleChoiceExerciseConfig,
  OrderStepsExerciseConfig,
  SingleChoiceExerciseConfig,
  TrueFalseExerciseConfig,
} from '@/types/exercise'

/** Закрытые типы MVP (порт из Prompt Lab). */
export type ClosedActivityConfig =
  | SingleChoiceExerciseConfig
  | MultipleChoiceExerciseConfig
  | TrueFalseExerciseConfig
  | FillTheBlankExerciseConfig
  | MatchPairsExerciseConfig
  | OrderStepsExerciseConfig

export type FreeTextActivityType =
  | 'freeResponse'
  | 'explainLikeImFive'
  | 'teachBack'
  | 'giveYourExample'

export type FreeTextActivityConfig = {
  id: string
  type: FreeTextActivityType
  prompt: string
  concept: string
  rubric: string[]
  modelAnswer: string
  /** Ключевые термины для локальной demo-оценки (этап 1/demo без AI). */
  keywords: string[]
  hint?: string
  explanation?: ExerciseExplanation
}

export type BuildTheBridgeActivityConfig = {
  id: string
  type: 'buildTheBridge'
  prompt: string
  conceptA: string
  conceptB: string
  rubric: string[]
  modelAnswer: string
  keywords: string[]
  hint?: string
  explanation?: ExerciseExplanation
}

export type ActivityConfig =
  | ClosedActivityConfig
  | FreeTextActivityConfig
  | BuildTheBridgeActivityConfig

export type ActivityResultStatus =
  | 'correct'
  | 'partial'
  | 'incorrect'
  | 'timeout'
  | 'skipped'

export type ActivityResult = {
  activityId: string
  score: number
  maxScore: number
  status: ActivityResultStatus
  userAnswer: unknown
  feedback?: string
  timedOut?: boolean
}

export function isFreeTextActivity(
  activity: ActivityConfig,
): activity is FreeTextActivityConfig {
  return (
    activity.type === 'freeResponse' ||
    activity.type === 'explainLikeImFive' ||
    activity.type === 'teachBack' ||
    activity.type === 'giveYourExample'
  )
}

export function isBuildTheBridgeActivity(
  activity: ActivityConfig,
): activity is BuildTheBridgeActivityConfig {
  return activity.type === 'buildTheBridge'
}

export function isClosedActivity(
  activity: ActivityConfig,
): activity is ClosedActivityConfig {
  return (
    activity.type === 'singleChoice' ||
    activity.type === 'multipleChoice' ||
    activity.type === 'trueFalse' ||
    activity.type === 'fillTheBlank' ||
    activity.type === 'matchPairs' ||
    activity.type === 'orderSteps'
  )
}
