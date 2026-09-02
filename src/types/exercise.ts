export type ExerciseMode = 'inline' | 'test'

export type ExerciseResult = {
  exerciseId: string
  isCorrect: boolean
  score: number
  maxScore: number
  userAnswer: unknown
}

export type ExerciseExplanation = {
  correct: string
  incorrect: string
}

export type ChoiceOption = { id: string; label: string }

export type SingleChoiceExerciseConfig = {
  id: string
  type: 'singleChoice'
  prompt: string
  options: ChoiceOption[]
  correctOptionIds: [string] | string[]
  explanation: ExerciseExplanation
}

export type MultipleChoiceExerciseConfig = {
  id: string
  type: 'multipleChoice'
  prompt: string
  options: ChoiceOption[]
  correctOptionIds: string[]
  explanation: ExerciseExplanation
}

export type TrueFalseExerciseConfig = {
  id: string
  type: 'trueFalse'
  prompt: string
  correctAnswer: boolean
  explanation: ExerciseExplanation
}

export type FillTheBlankExerciseConfig = {
  id: string
  type: 'fillTheBlank'
  prompt: string
  blanks: { id: string; correctAnswers: string[] }[]
  explanation: ExerciseExplanation
}

export type MatchPair = {
  leftId: string
  leftLabel: string
  rightId: string
  rightLabel: string
}

export type MatchPairsExerciseConfig = {
  id: string
  type: 'matchPairs'
  prompt: string
  pairs: MatchPair[]
  explanation: ExerciseExplanation
}

export type OrderStep = {
  id: string
  label: string
}

export type OrderStepsExerciseConfig = {
  id: string
  type: 'orderSteps'
  prompt: string
  steps: OrderStep[]
  correctOrderIds: string[]
  explanation: ExerciseExplanation
}

export type PromptBuilderBlock = {
  id: string
  label: string
  preview: string
}

export type PromptBuilderSlot = {
  slotId: string
  title: string
  hint: string
  correctBlockId: string
}

export type PromptBuilderExerciseConfig = {
  id: string
  type: 'promptBuilder'
  prompt: string
  slots: PromptBuilderSlot[]
  blocks: PromptBuilderBlock[]
  explanation: ExerciseExplanation
}

export type HallucinationSegment = {
  id: string
  text: string
}

export type SpotTheHallucinationExerciseConfig = {
  id: string
  type: 'spotTheHallucination'
  prompt: string
  responseLabel?: string
  segments: HallucinationSegment[]
  correctSpanIds: string[]
  explanation: ExerciseExplanation
}

export type FailureModePickerExerciseConfig = {
  id: string
  type: 'failureModePicker'
  prompt: string
  weakPrompt: string
  options: ChoiceOption[]
  correctOptionIds: string[]
  explanation: ExerciseExplanation
}

export type ExerciseConfig =
  | SingleChoiceExerciseConfig
  | MultipleChoiceExerciseConfig
  | TrueFalseExerciseConfig
  | FillTheBlankExerciseConfig
  | MatchPairsExerciseConfig
  | OrderStepsExerciseConfig
  | PromptBuilderExerciseConfig
  | SpotTheHallucinationExerciseConfig
  | FailureModePickerExerciseConfig

export type BaseExerciseProps<TConfig extends ExerciseConfig> = {
  config: TConfig
  mode?: ExerciseMode
  title?: string
  onResult?: (result: ExerciseResult) => void
  onNext?: () => void
}
