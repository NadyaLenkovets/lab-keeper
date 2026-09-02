import type { ExerciseResult } from '@/types/exercise'

export type TestScoreSummary = {
  totalQuestions: number
  correctCount: number
  percent: number
  totalScore: number
  maxScore: number
}

export function calculateScore(results: ExerciseResult[]): TestScoreSummary {
  if (results.length === 0) {
    return {
      totalQuestions: 0,
      correctCount: 0,
      percent: 0,
      totalScore: 0,
      maxScore: 0,
    }
  }

  const totalScore = results.reduce((sum, r) => sum + r.score, 0)
  const maxScore = results.reduce((sum, r) => sum + r.maxScore, 0)
  const correctCount = results.filter((r) => r.isCorrect).length
  const percent = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0

  return {
    totalQuestions: results.length,
    correctCount,
    percent,
    totalScore,
    maxScore,
  }
}
