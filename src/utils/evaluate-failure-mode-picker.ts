import { evaluateMultipleChoice } from './evaluate-multiple-choice'

export function evaluateFailureModePicker(
  selectedOptionIds: string[],
  correctOptionIds: string[],
): { isCorrect: boolean; score: number; maxScore: number } {
  return evaluateMultipleChoice(selectedOptionIds, correctOptionIds, true)
}
