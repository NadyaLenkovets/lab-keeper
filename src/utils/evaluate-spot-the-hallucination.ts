export function evaluateSpotTheHallucination(
  selectedSpanIds: string[],
  correctSpanIds: string[],
): { isCorrect: boolean; score: number; maxScore: number } {
  const maxScore = 1
  const selected = new Set(selectedSpanIds)
  const correct = new Set(correctSpanIds)
  const totalCorrect = correct.size

  if (totalCorrect === 0) {
    return { isCorrect: selected.size === 0, score: selected.size === 0 ? 1 : 0, maxScore }
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
