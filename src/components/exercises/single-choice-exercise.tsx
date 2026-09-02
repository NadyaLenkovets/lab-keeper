import { Box, Text } from '@chakra-ui/react'
import { useRef, useState } from 'react'
import type { BaseExerciseProps, SingleChoiceExerciseConfig } from '@/types/exercise'
import { evaluateMultipleChoice } from '@/utils/evaluate-multiple-choice'
import { useExerciseState } from '@/hooks/use-exercise-state'
import { ChoiceOptionsList } from './choice-options-list'
import { ExerciseShell } from './exercise-shell'

export function SingleChoiceExercise({
  config,
  mode = 'inline',
  title,
  onResult,
  onNext,
}: BaseExerciseProps<SingleChoiceExerciseConfig>) {
  const [selected, setSelected] = useState<string[]>([])
  const { uiState, result, submit } = useExerciseState(onResult)
  const isAnswered = uiState === 'answered'
  const checkHintRef = useRef<HTMLDivElement>(null)
  const correctIds = Array.isArray(config.correctOptionIds)
    ? config.correctOptionIds.slice(0, 1)
    : [config.correctOptionIds]

  const toggle = (id: string) => {
    if (isAnswered) return
    setSelected([id])
    requestAnimationFrame(() => {
      checkHintRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    })
  }

  const handleCheck = () => {
    const evaluation = evaluateMultipleChoice(selected, correctIds, false)
    submit({
      exerciseId: config.id,
      isCorrect: evaluation.isCorrect,
      score: evaluation.score,
      maxScore: evaluation.maxScore,
      userAnswer: { selectedOptionIds: selected },
    })
  }

  return (
    <ExerciseShell
      mode={mode}
      title={title}
      onNext={onNext}
      uiState={uiState}
      isCorrect={result?.isCorrect ?? null}
      score={result?.score}
      maxScore={result?.maxScore}
      explanation={isAnswered ? config.explanation : null}
      onCheck={handleCheck}
      canCheck={selected.length > 0}
      accentBorder="#84CC16"
    >
      <Box>
        <Text fontSize="xs" color="#84CC16" fontWeight="600" mb={2}>
          ОДИН ПРАВИЛЬНЫЙ ОТВЕТ
        </Text>
        <Text fontSize="lg" fontWeight="600" color="#FFFFFF">
          {config.prompt}
        </Text>
      </Box>
      <ChoiceOptionsList
        options={config.options}
        selectedIds={selected}
        correctOptionIds={correctIds}
        isAnswered={isAnswered}
        selectionMode="single"
        prompt={config.prompt}
        onToggle={toggle}
      />
      <Box ref={checkHintRef} h={0} />
    </ExerciseShell>
  )
}
