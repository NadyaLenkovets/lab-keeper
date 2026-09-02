export type AchievementId =
  | 'first-checkpoint'
  | 'streak-5'
  | 'finish-on-time'

export type Achievement = {
  id: AchievementId
  title: string
  description: string
}

export const ACHIEVEMENTS: Record<AchievementId, Achievement> = {
  'first-checkpoint': {
    id: 'first-checkpoint',
    title: 'Первый чекпоинт',
    description: 'Завершили первый смысловой блок путешествия',
  },
  'streak-5': {
    id: 'streak-5',
    title: 'Серия ×5',
    description: 'Пять верных ответов подряд',
  },
  'finish-on-time': {
    id: 'finish-on-time',
    title: 'Финиш вовремя',
    description: 'Прошли весь journey без таймаутов',
  },
}

export type GamificationState = {
  xp: number
  streak: number
  bestStreak: number
  unlockedAchievements: AchievementId[]
  /** Всплывшие в этой сессии (для UI-баннера). */
  justUnlocked: AchievementId[]
}
