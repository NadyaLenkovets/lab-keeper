import { useCallback, useState } from 'react'
import type { ExerciseResult } from '@/types/exercise'

export type ExerciseUiState = 'idle' | 'answered'

export function useExerciseState(onResult?: (result: ExerciseResult) => void) {
  const [uiState, setUiState] = useState<ExerciseUiState>('idle')
  const [result, setResult] = useState<ExerciseResult | null>(null)

  const submit = useCallback(
    (next: ExerciseResult) => {
      setResult(next)
      setUiState('answered')
      onResult?.(next)
    },
    [onResult],
  )

  const reset = useCallback(() => {
    setResult(null)
    setUiState('idle')
  }, [])

  return { uiState, result, submit, reset }
}
