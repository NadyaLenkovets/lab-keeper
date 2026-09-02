import { describe, expect, it } from 'vitest'
import { getDemoJourney } from '@/content/demo/demo-journey'
import { buildJourneyReport } from '@/utils/build-report'
import { buildLocalNextSteps } from '@/utils/next-steps'
import type { JourneyProgress } from '@/types/journey'

describe('buildLocalNextSteps', () => {
  it('предлагает подтянуть слабые блоки', () => {
    const journey = getDemoJourney()
    const first = journey.checkpoints[0].activities[0]
    const progress: JourneyProgress = {
      journeyId: journey.id,
      currentFlatIndex: 1,
      completed: false,
      updatedAt: new Date().toISOString(),
      results: [
        {
          activityId: first.id,
          score: 0,
          maxScore: 1,
          status: 'incorrect',
          userAnswer: null,
          feedback: 'Нужно определение',
        },
      ],
    }
    const report = buildJourneyReport(journey, progress)
    const next = buildLocalNextSteps(report)
    expect(next.recommendations.length).toBeGreaterThan(0)
    expect(next.summary).toMatch(/итог|%/i)
    expect(next.recommendations[0].title).toMatch(/Подтянуть/)
  })
})
