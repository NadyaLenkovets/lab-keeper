import type { MatchPair } from '@/types/exercise'

export type MatchPairsAnswer = Record<string, string>

export function evaluateMatchPairs(
  matches: MatchPairsAnswer,
  pairs: MatchPair[],
): { isCorrect: boolean; score: number; maxScore: number } {
  if (pairs.length === 0) {
    return { isCorrect: true, score: 1, maxScore: 1 }
  }

  let correctCount = 0
  for (const pair of pairs) {
    if (matches[pair.leftId] === pair.rightId) {
      correctCount += 1
    }
  }

  const score = correctCount / pairs.length
  return {
    isCorrect: correctCount === pairs.length,
    score,
    maxScore: 1,
  }
}
