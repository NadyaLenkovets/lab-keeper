import type { ActivityResult } from '@/types/activity'
import type { GamificationState } from '@/types/gamification'
import type { FlatActivityStep } from '@/types/journey'
import {
  applyActivityToGamification,
  createGamificationState,
  unlockAchievement,
  withFinishAchievements,
} from '@/utils/gamification'

export type RunPhase = 'running' | 'finished'

export type JourneyRunState = {
  phase: RunPhase
  currentIndex: number
  results: ActivityResult[]
  awaitingNext: boolean
  timedOut: boolean
  game: GamificationState
}

export function createJourneyRunState(): JourneyRunState {
  return {
    phase: 'running',
    currentIndex: 0,
    results: [],
    awaitingNext: false,
    timedOut: false,
    game: createGamificationState(),
  }
}

function checkpointFullyAnswered(
  steps: FlatActivityStep[],
  results: ActivityResult[],
  checkpointIndex: number,
): boolean {
  const needed = steps
    .filter((s) => s.checkpointIndex === checkpointIndex)
    .map((s) => s.activity.id)
  const done = new Set(results.map((r) => r.activityId))
  return needed.length > 0 && needed.every((id) => done.has(id))
}

function firstIndexOfCheckpoint(
  steps: FlatActivityStep[],
  checkpointIndex: number,
): number {
  const idx = steps.findIndex((s) => s.checkpointIndex === checkpointIndex)
  return idx === -1 ? steps.length : idx
}

export type JourneyRunAction =
  | { type: 'result'; result: ActivityResult; steps: FlatActivityStep[] }
  | { type: 'next'; steps: FlatActivityStep[] }
  | { type: 'timeout'; steps: FlatActivityStep[] }

export function journeyRunReducer(
  state: JourneyRunState,
  action: JourneyRunAction,
): JourneyRunState {
  switch (action.type) {
    case 'result': {
      if (state.timedOut || state.phase !== 'running') return state
      const nextResults = [...state.results, action.result]
      const completedFirst = checkpointFullyAnswered(
        action.steps,
        nextResults,
        0,
      )
      const nextGame = applyActivityToGamification(state.game, action.result, {
        completedFirstCheckpoint: completedFirst,
      })
      return {
        ...state,
        results: nextResults,
        game: nextGame,
        awaitingNext: true,
      }
    }
    case 'next': {
      if (state.phase !== 'running') return state
      if (state.currentIndex + 1 >= action.steps.length) {
        return {
          ...state,
          awaitingNext: false,
          phase: 'finished',
          game: withFinishAchievements(state.game, state.results),
        }
      }
      const nextIndex = state.currentIndex + 1
      const leavingCp = action.steps[state.currentIndex]?.checkpointIndex
      const enteringCp = action.steps[nextIndex]?.checkpointIndex
      return {
        ...state,
        awaitingNext: false,
        currentIndex: nextIndex,
        timedOut: leavingCp !== enteringCp ? false : state.timedOut,
      }
    }
    case 'timeout': {
      if (state.phase !== 'running') return state
      const step = action.steps[state.currentIndex]
      if (!step) return state

      const answeredIds = new Set(state.results.map((r) => r.activityId))
      const remainingInCp = action.steps.filter(
        (s) =>
          s.checkpointIndex === step.checkpointIndex &&
          !answeredIds.has(s.activity.id),
      )

      let nextResults = [...state.results]
      let nextGame: GamificationState = { ...state.game, justUnlocked: [] }

      for (const rem of remainingInCp) {
        const timeoutResult: ActivityResult = {
          activityId: rem.activity.id,
          score: 0,
          maxScore: 1,
          status: 'timeout',
          userAnswer: null,
          timedOut: true,
          feedback: 'Время чекпоинта вышло — шаг засчитан как 0.',
        }
        nextGame = applyActivityToGamification(nextGame, timeoutResult)
        nextResults = [...nextResults, timeoutResult]
      }

      if (checkpointFullyAnswered(action.steps, nextResults, 0)) {
        nextGame = unlockAchievement(nextGame, 'first-checkpoint')
      }

      const nextCp = step.checkpointIndex + 1
      const hasMore = action.steps.some((s) => s.checkpointIndex === nextCp)

      if (!hasMore) {
        return {
          ...state,
          results: nextResults,
          game: withFinishAchievements(nextGame, nextResults),
          awaitingNext: false,
          timedOut: true,
          phase: 'finished',
          currentIndex: action.steps.length,
        }
      }

      return {
        ...state,
        results: nextResults,
        game: nextGame,
        awaitingNext: false,
        timedOut: false,
        currentIndex: firstIndexOfCheckpoint(action.steps, nextCp),
      }
    }
    default:
      return state
  }
}
