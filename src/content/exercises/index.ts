import type { ExerciseConfig } from '@/types/exercise'
import { llmExercises } from './llm-exercises'
import { hallExercises } from './hall-exercises'
import { promptExercises } from './prompt-exercises'

export const exercisesById: Record<string, ExerciseConfig> = {
  ...llmExercises,
  ...hallExercises,
  ...promptExercises,
}

export function getExerciseById(id: string): ExerciseConfig | undefined {
  return exercisesById[id]
}
