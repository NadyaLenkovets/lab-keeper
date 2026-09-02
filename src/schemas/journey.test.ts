import { describe, expect, it } from 'vitest'
import { demoJourney } from '@/content/demo/demo-journey'
import { safeParseJourney } from '@/schemas/journey'
import { countActivities, flattenJourney, gradeFreeLocally } from '@/utils/journey'

describe('journey schema + demo', () => {
  it('валидирует demo-journey', () => {
    const parsed = safeParseJourney(demoJourney)
    expect(parsed.success).toBe(true)
    expect(demoJourney.checkpoints).toHaveLength(4)
    expect(countActivities(demoJourney)).toBeGreaterThanOrEqual(8)
  })

  it('flatten сохраняет порядок чекпоинтов', () => {
    const steps = flattenJourney(demoJourney)
    expect(steps[0]?.checkpoint.id).toBe('cp-what')
    expect(steps.at(-1)?.checkpoint.id).toBe('cp-practice')
  })

  it('gradeFreeLocally даёт partial при частичном совпадении', () => {
    const activity = demoJourney.checkpoints[0].activities.find(
      (a) => a.type === 'freeResponse',
    )
    expect(activity?.type).toBe('freeResponse')
    if (!activity || activity.type !== 'freeResponse') return
    const result = gradeFreeLocally(
      activity,
      'Клиент может потерять доверие из-за ложного факта',
    )
    expect(result.status === 'partial' || result.status === 'correct').toBe(
      true,
    )
    expect(result.score).toBeGreaterThan(0)
  })
})
