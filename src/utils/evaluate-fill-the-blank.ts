import { normalizeText } from './normalize-text'

export type FillTheBlankAnswer = Record<string, string>

export function evaluateFillTheBlank(
  answers: FillTheBlankAnswer,
  blanks: { id: string; correctAnswers: string[] }[],
): { isCorrect: boolean; score: number; maxScore: number } {
  if (blanks.length === 0) {
    return { isCorrect: true, score: 1, maxScore: 1 }
  }

  let correctCount = 0

  for (const blank of blanks) {
    const raw = answers[blank.id] ?? ''
    const normalized = normalizeText(raw)
    const matches = blank.correctAnswers.some(
      (answer) => normalizeText(answer) === normalized,
    )
    if (matches) {
      correctCount += 1
    }
  }

  const maxScore = blanks.length
  const score = correctCount
  const isCorrect = correctCount === blanks.length

  return {
    isCorrect,
    score: score / maxScore,
    maxScore: 1,
  }
}
