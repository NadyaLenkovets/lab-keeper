import type { ActivityConfig } from '@/types/activity'
import { BuildTheBridgeExercise } from '@/components/exercises/build-the-bridge-exercise'
import { FreeTextExercise } from '@/components/exercises/free-text-exercise'
import { FillTheBlankExercise } from '@/components/exercises/fill-the-blank-exercise'
import { MatchPairsExercise } from '@/components/exercises/match-pairs-exercise'
import { MultipleChoiceExercise } from '@/components/exercises/multiple-choice-exercise'
import { OrderStepsExercise } from '@/components/exercises/order-steps-exercise'
import { SingleChoiceExercise } from '@/components/exercises/single-choice-exercise'
import { TrueFalseExercise } from '@/components/exercises/true-false-exercise'

/** Справочник типов MVP journey → компонент (для документации / расширений). */
export const journeyActivityTypes: ActivityConfig['type'][] = [
  'singleChoice',
  'multipleChoice',
  'trueFalse',
  'fillTheBlank',
  'matchPairs',
  'orderSteps',
  'freeResponse',
  'explainLikeImFive',
  'teachBack',
  'giveYourExample',
  'buildTheBridge',
]

export {
  SingleChoiceExercise,
  MultipleChoiceExercise,
  TrueFalseExercise,
  FillTheBlankExercise,
  MatchPairsExercise,
  OrderStepsExercise,
  FreeTextExercise,
  BuildTheBridgeExercise,
}
