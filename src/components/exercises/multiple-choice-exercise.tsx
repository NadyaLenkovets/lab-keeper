import { Box, Text } from '@chakra-ui/react'
import { useRef, useState } from 'react'
import type { BaseExerciseProps, MultipleChoiceExerciseConfig } from '@/types/exercise'
import { evaluateMultipleChoice } from '@/utils/evaluate-multiple-choice'
import { useExerciseState } from '@/hooks/use-exercise-state'
import { ChoiceOptionsList } from './choice-options-list'
import { ExerciseShell } from './exercise-shell'

export function MultipleChoiceExercise({
  config,
  mode = 'inline',
  title,
  onResult,
  onNext,
}: BaseExerciseProps<MultipleChoiceExerciseConfig>) {
  const [selected, setSelected] = useState<string[]>([])
  const { uiState, result, submit } = useExerciseState(onResult)
  const isAnswered = uiState === 'answered'
  const checkHintRef = useRef<HTMLDivElement>(null)

  const toggle = (id: string) => {
    if (isAnswered) return
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
    requestAnimationFrame(() => {
      checkHintRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    })
  }

  const handleCheck = () => {
    const evaluation = evaluateMultipleChoice(
      selected,
      config.correctOptionIds,
      true,
    )
    submit({
      exerciseId: config.id,
      isCorrect: evaluation.isCorrect,
      score: evaluation.score,
      maxScore: evaluation.maxScore,
      userAnswer: { selectedOptionIds: selected },
    })
  }

  const canSubmit = selected.length > 0

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
      canCheck={canSubmit}
      checkHint={
        canSubmit
          ? 'Можно проверить ответ с частичным баллом'
          : 'Выберите хотя бы один вариант'
      }
      accentBorder="#65A30D"
    >
      <Box>
        <Text fontSize="xs" color="#84CC16" fontWeight="600" mb={2}>
          НЕСКОЛЬКО ПРАВИЛЬНЫХ ОТВЕТОВ — возможен частичный балл
        </Text>
        <Text fontSize="lg" fontWeight="600" color="#FFFFFF">
          {config.prompt}
        </Text>
      </Box>
      <ChoiceOptionsList
        options={config.options}
        selectedIds={selected}
        correctOptionIds={config.correctOptionIds}
        isAnswered={isAnswered}
        selectionMode="multiple"
        prompt={config.prompt}
        onToggle={toggle}
      />
      <Box ref={checkHintRef} h={0} />
    </ExerciseShell>
  )
}
