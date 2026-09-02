import { describe, expect, it } from 'vitest'
import type { ActivityResult } from '@/types/activity'
import {
  applyActivityToGamification,
  createGamificationState,
  streakMultiplier,
  withFinishAchievements,
  xpGainForResult,
} from '@/utils/gamification'

const correct = (id: string): ActivityResult => ({
  activityId: id,
  score: 1,
  maxScore: 1,
  status: 'correct',
  userAnswer: true,
})

describe('gamification', () => {
  it('множитель растёт со streak', () => {
    expect(streakMultiplier(1)).toBe(1)
    expect(streakMultiplier(2)).toBe(1.1)
    expect(streakMultiplier(3)).toBe(1.25)
  })

  it('считает XP с множителем', () => {
    expect(xpGainForResult(1, 1, 1, 'correct')).toBe(10)
    expect(xpGainForResult(1, 1, 2, 'correct')).toBe(11)
    expect(xpGainForResult(1, 1, 3, 'correct')).toBe(13)
    expect(xpGainForResult(0.5, 1, 3, 'partial')).toBe(5)
  })

  it('сбрасывает серию на ошибке и копит XP', () => {
    let state = createGamificationState()
    state = applyActivityToGamification(state, correct('a'))
    state = applyActivityToGamification(state, correct('b'))
    expect(state.streak).toBe(2)
    state = applyActivityToGamification(state, {
      activityId: 'c',
      score: 0,
      maxScore: 1,
      status: 'incorrect',
      userAnswer: false,
    })
    expect(state.streak).toBe(0)
    expect(state.xp).toBeGreaterThan(0)
  })

  it('открывает streak-5 и finish-on-time', () => {
    let state = createGamificationState()
    const results: ActivityResult[] = []
    for (let i = 0; i < 5; i += 1) {
      const r = correct(`s${i}`)
      results.push(r)
      state = applyActivityToGamification(state, r)
    }
    expect(state.unlockedAchievements).toContain('streak-5')

    const finished = withFinishAchievements(state, results)
    expect(finished.unlockedAchievements).toContain('finish-on-time')

    const withTimeout = withFinishAchievements(state, [
      ...results,
      {
        activityId: 't',
        score: 0,
        maxScore: 1,
        status: 'timeout',
        userAnswer: null,
        timedOut: true,
      },
    ])
    expect(withTimeout.unlockedAchievements).not.toContain('finish-on-time')
  })
})
