export function evaluateOrderSteps(
  orderIds: string[],
  correctOrderIds: string[],
): { isCorrect: boolean; score: number; maxScore: number } {
  const total = correctOrderIds.length
  if (total === 0) {
    return { isCorrect: true, score: 1, maxScore: 1 }
  }

  let correctPositions = 0
  for (let i = 0; i < total; i += 1) {
    if (orderIds[i] === correctOrderIds[i]) {
      correctPositions += 1
    }
  }

  const score = correctPositions / total
  return {
    isCorrect: correctPositions === total,
    score,
    maxScore: 1,
  }
}
