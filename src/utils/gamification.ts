import type { ActivityResult, ActivityResultStatus } from '@/types/activity'
import type {
  AchievementId,
  GamificationState,
} from '@/types/gamification'

export function createGamificationState(): GamificationState {
  return {
    xp: 0,
    streak: 0,
    bestStreak: 0,
    unlockedAchievements: [],
    justUnlocked: [],
  }
}

/** Множитель: 1 → 1.1 (≥2 подряд) → 1.25 (≥3 подряд). */
export function streakMultiplier(streak: number): number {
  if (streak >= 3) return 1.25
  if (streak >= 2) return 1.1
  return 1
}

export function nextStreak(
  prev: number,
  status: ActivityResultStatus,
): number {
  if (status === 'correct') return prev + 1
  return 0
}

export function xpGainForResult(
  score: number,
  maxScore: number,
  streakAfter: number,
  status: ActivityResultStatus,
): number {
  if (maxScore <= 0 || score <= 0) return 0
  const base = (score / maxScore) * 10
  const mult = status === 'correct' ? streakMultiplier(streakAfter) : 1
  return Math.round(base * mult)
}

export function unlockAchievement(
  state: GamificationState,
  id: AchievementId,
): GamificationState {
  if (state.unlockedAchievements.includes(id)) {
    return state
  }
  return {
    ...state,
    unlockedAchievements: [...state.unlockedAchievements, id],
    justUnlocked: [...state.justUnlocked, id],
  }
}

export function applyActivityToGamification(
  state: GamificationState,
  result: ActivityResult,
  opts?: {
    completedFirstCheckpoint?: boolean
  },
): GamificationState {
  let next: GamificationState = {
    ...state,
    justUnlocked: [],
  }

  const streak = nextStreak(state.streak, result.status)
  const gain = xpGainForResult(
    result.score,
    result.maxScore,
    streak,
    result.status,
  )

  next = {
    ...next,
    streak,
    bestStreak: Math.max(state.bestStreak, streak),
    xp: state.xp + gain,
  }

  if (streak >= 5) {
    next = unlockAchievement(next, 'streak-5')
  }

  if (opts?.completedFirstCheckpoint) {
    next = unlockAchievement(next, 'first-checkpoint')
  }

  return next
}

export function withFinishAchievements(
  state: GamificationState,
  results: ActivityResult[],
): GamificationState {
  const hadTimeout = results.some((r) => r.status === 'timeout')
  if (hadTimeout) return { ...state, justUnlocked: [] }
  return unlockAchievement({ ...state, justUnlocked: [] }, 'finish-on-time')
}

export function formatXp(xp: number): string {
  return `${xp} XP`
}
