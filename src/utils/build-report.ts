import type { ActivityConfig, ActivityResult } from '@/types/activity'
import type { Checkpoint, Journey, JourneyProgress } from '@/types/journey'
import { activityTypeLabel } from '@/utils/format-user-answer'
import { flattenJourney } from '@/utils/journey'

export type ReportActivityRow = {
  activity: ActivityConfig
  typeLabel: string
  result: ActivityResult | null
  checkpointTitle: string
  concept: string
}

export type ReportCheckpointBlock = {
  checkpoint: Checkpoint
  rows: ReportActivityRow[]
  score: number
  maxScore: number
  percent: number
}

export type JourneyReport = {
  journey: Journey
  progress: JourneyProgress | null
  totalScore: number
  maxScore: number
  percent: number
  timeouts: number
  answered: number
  totalActivities: number
  blocks: ReportCheckpointBlock[]
}

export function buildJourneyReport(
  journey: Journey,
  progress: JourneyProgress | null,
): JourneyReport {
  const byId = new Map(
    (progress?.results ?? []).map((r) => [r.activityId, r] as const),
  )
  const flat = flattenJourney(journey)

  const blocks: ReportCheckpointBlock[] = journey.checkpoints.map((checkpoint) => {
    const rows: ReportActivityRow[] = checkpoint.activities.map((activity) => ({
      activity,
      typeLabel: activityTypeLabel(activity.type),
      result: byId.get(activity.id) ?? null,
      checkpointTitle: checkpoint.title,
      concept: checkpoint.concept,
    }))
    const score = rows.reduce((s, r) => s + (r.result?.score ?? 0), 0)
    const maxScore = rows.reduce(
      (s, r) => s + (r.result?.maxScore ?? 1),
      0,
    )
    return {
      checkpoint,
      rows,
      score,
      maxScore,
      percent: maxScore > 0 ? Math.round((score / maxScore) * 100) : 0,
    }
  })

  const totalScore = blocks.reduce((s, b) => s + b.score, 0)
  const maxScore = blocks.reduce((s, b) => s + b.maxScore, 0)
  const timeouts =
    progress?.results.filter((r) => r.status === 'timeout').length ?? 0

  return {
    journey,
    progress,
    totalScore,
    maxScore,
    percent: maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0,
    timeouts,
    answered: progress?.results.length ?? 0,
    totalActivities: flat.length,
    blocks,
  }
}

export const STATUS_LABELS: Record<
  NonNullable<ActivityResult['status']>,
  string
> = {
  correct: 'Верно',
  partial: 'Частично',
  incorrect: 'Неверно',
  timeout: 'Время вышло',
  skipped: 'Пропущено',
}
