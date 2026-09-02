import { describe, expect, it } from 'vitest'
import { getDemoJourney } from '@/content/demo/demo-journey'
import { buildJourneyReport } from '@/utils/build-report'
import type { JourneyProgress } from '@/types/journey'

describe('buildJourneyReport', () => {
  it('считает % и блоки по demo + progress', () => {
    const journey = getDemoJourney()
    const first = journey.checkpoints[0].activities[0]
    const progress: JourneyProgress = {
      journeyId: journey.id,
      currentFlatIndex: 1,
      completed: false,
      updatedAt: new Date().toISOString(),
      xp: 10,
      streak: 1,
      bestStreak: 1,
      results: [
        {
          activityId: first.id,
          score: 1,
          maxScore: 1,
          status: 'correct',
          userAnswer: { selectedOptionIds: ['b'] },
          feedback: 'ок',
        },
      ],
    }

    const report = buildJourneyReport(journey, progress)
    expect(report.blocks).toHaveLength(journey.checkpoints.length)
    expect(report.answered).toBe(1)
    expect(report.blocks[0].rows[0].result?.feedback).toBe('ок')
    expect(report.percent).toBeGreaterThan(0)
  })
})
