export function evaluateTrueFalse(
  userAnswer: boolean | null,
  correctAnswer: boolean,
): { isCorrect: boolean; score: number; maxScore: number } {
  const maxScore = 1
  if (userAnswer === null) {
    return { isCorrect: false, score: 0, maxScore }
  }
  const isCorrect = userAnswer === correctAnswer
  return { isCorrect, score: isCorrect ? 1 : 0, maxScore }
}
