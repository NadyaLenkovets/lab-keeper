import type { ActivityConfig } from '@/types/activity'

export type Checkpoint = {
  id: string
  title: string
  concept: string
  dependsOn: string[]
  difficulty: 1 | 2 | 3
  timeLimitSec: number
  activities: ActivityConfig[]
}

export type Journey = {
  id: string
  title: string
  sourceSummary: string
  checkpoints: Checkpoint[]
  createdAt: string
  origin?: 'human' | 'ai' | 'demo'
}

export type JourneyProgress = {
  journeyId: string
  results: import('@/types/activity').ActivityResult[]
  currentFlatIndex: number
  completed: boolean
  updatedAt: string
  xp?: number
  streak?: number
  bestStreak?: number
  unlockedAchievements?: import('@/types/gamification').AchievementId[]
}

export type FlatActivityStep = {
  flatIndex: number
  checkpointIndex: number
  activityIndex: number
  checkpoint: Checkpoint
  activity: ActivityConfig
}
