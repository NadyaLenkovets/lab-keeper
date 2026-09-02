import type { ComponentType } from 'react'
import type { BaseExerciseProps, ExerciseConfig } from '@/types/exercise'
import { FailureModePickerExercise } from './failure-mode-picker-exercise'
import { FillTheBlankExercise } from './fill-the-blank-exercise'
import { MatchPairsExercise } from './match-pairs-exercise'
import { MultipleChoiceExercise } from './multiple-choice-exercise'
import { OrderStepsExercise } from './order-steps-exercise'
import { PromptBuilderExercise } from './prompt-builder-exercise'
import { SingleChoiceExercise } from './single-choice-exercise'
import { SpotTheHallucinationExercise } from './spot-the-hallucination-exercise'
import { TrueFalseExercise } from './true-false-exercise'

type ExerciseComponent = ComponentType<BaseExerciseProps<ExerciseConfig>>

export const exerciseRegistry: Record<ExerciseConfig['type'], ExerciseComponent> = {
  singleChoice: SingleChoiceExercise as ExerciseComponent,
  multipleChoice: MultipleChoiceExercise as ExerciseComponent,
  trueFalse: TrueFalseExercise as ExerciseComponent,
  fillTheBlank: FillTheBlankExercise as ExerciseComponent,
  matchPairs: MatchPairsExercise as ExerciseComponent,
  orderSteps: OrderStepsExercise as ExerciseComponent,
  promptBuilder: PromptBuilderExercise as ExerciseComponent,
  spotTheHallucination: SpotTheHallucinationExercise as ExerciseComponent,
  failureModePicker: FailureModePickerExercise as ExerciseComponent,
}
