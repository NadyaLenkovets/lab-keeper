export type MultipleChoiceAnswer = {
  selectedOptionIds: string[]
}

export function evaluateMultipleChoice(
  selectedOptionIds: string[],
  correctOptionIds: string[],
  allowMultiple = false,
): { isCorrect: boolean; score: number; maxScore: number } {
  const maxScore = 1
  const selected = new Set(selectedOptionIds)
  const correct = new Set(correctOptionIds)

  if (!allowMultiple) {
    const isCorrect =
      selected.size === 1 &&
      correct.size === 1 &&
      selectedOptionIds[0] === correctOptionIds[0]
    return { isCorrect, score: isCorrect ? 1 : 0, maxScore }
  }

  const totalCorrect = correct.size
  if (totalCorrect === 0) {
    return { isCorrect: false, score: 0, maxScore }
  }

  let correctHits = 0
  let wrongHits = 0
  for (const id of selected) {
    if (correct.has(id)) correctHits += 1
    else wrongHits += 1
  }

  const raw = (correctHits - wrongHits) / totalCorrect
  const score = Math.max(0, Math.min(1, raw))
  const isCorrect =
    score === 1 && wrongHits === 0 && correctHits === totalCorrect

  return { isCorrect, score, maxScore }
}
