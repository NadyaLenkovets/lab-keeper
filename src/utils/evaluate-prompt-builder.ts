import type { PromptBuilderSlot } from '@/types/exercise'

export type PromptBuilderAnswer = Record<string, string>

export function evaluatePromptBuilder(
  assignments: PromptBuilderAnswer,
  slots: PromptBuilderSlot[],
): { isCorrect: boolean; score: number; maxScore: number } {
  if (slots.length === 0) {
    return { isCorrect: true, score: 1, maxScore: 1 }
  }

  let correctCount = 0
  for (const slot of slots) {
    if (assignments[slot.slotId] === slot.correctBlockId) {
      correctCount += 1
    }
  }

  const score = correctCount / slots.length
  return {
    isCorrect: correctCount === slots.length,
    score,
    maxScore: 1,
  }
}
