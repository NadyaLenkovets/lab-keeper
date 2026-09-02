import type { ActivityConfig, ActivityResult, ClosedActivityConfig } from '@/types/activity'
import type { ExerciseConfig, ExerciseResult } from '@/types/exercise'
import { getResultStatus } from '@/utils/get-result-status'

export function mapExerciseResultToActivity(
  exerciseResult: ExerciseResult,
  activity: ClosedActivityConfig,
): ActivityResult {
  const status = getResultStatus(exerciseResult)
  const feedback =
    status === 'incorrect'
      ? activity.explanation.incorrect
      : activity.explanation.correct

  return {
    activityId: exerciseResult.exerciseId,
    score: exerciseResult.score,
    maxScore: exerciseResult.maxScore,
    status,
    userAnswer: exerciseResult.userAnswer,
    feedback,
  }
}

export function isJourneyClosedType(
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

export function asExerciseConfig(activity: ClosedActivityConfig): ExerciseConfig {
  return activity
}
