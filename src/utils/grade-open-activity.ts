import type {
  ActivityResult,
  BuildTheBridgeActivityConfig,
  FreeTextActivityConfig,
} from '@/types/activity'
import { gradeAnswer } from '@/api/client'
import { gradeFreeLocally } from '@/utils/journey'

type Gradable = FreeTextActivityConfig | BuildTheBridgeActivityConfig

export async function gradeOpenActivity(
  activity: Gradable,
  userAnswer: string,
  options: { useRemote: boolean },
): Promise<ActivityResult> {
  if (!options.useRemote) {
    return gradeFreeLocally(activity, userAnswer)
  }

  try {
    const remote = await gradeAnswer({
      activityType: activity.type,
      prompt: activity.prompt,
      concept: 'concept' in activity ? activity.concept : undefined,
      conceptA: 'conceptA' in activity ? activity.conceptA : undefined,
      conceptB: 'conceptB' in activity ? activity.conceptB : undefined,
      rubric: activity.rubric,
      modelAnswer: activity.modelAnswer,
      userAnswer,
    })
    return {
      activityId: activity.id,
      score: remote.score,
      maxScore: remote.maxScore || 1,
      status: remote.status,
      userAnswer,
      feedback: remote.feedback,
    }
  } catch {
    return gradeFreeLocally(activity, userAnswer)
  }
}
