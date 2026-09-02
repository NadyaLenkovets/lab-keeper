import { Box, Text } from '@chakra-ui/react'
import { useRef, useState } from 'react'
import type { BaseExerciseProps, FailureModePickerExerciseConfig } from '@/types/exercise'
import { evaluateFailureModePicker } from '@/utils/evaluate-failure-mode-picker'
import { useExerciseState } from '@/hooks/use-exercise-state'
import { ChoiceOptionsList } from './choice-options-list'
import { ExerciseShell } from './exercise-shell'

export function FailureModePickerExercise({
  config,
  mode = 'inline',
  title,
  onResult,
  onNext,
}: BaseExerciseProps<FailureModePickerExerciseConfig>) {
  const [selected, setSelected] = useState<string[]>([])
  const { uiState, result, submit } = useExerciseState(onResult)
  const isAnswered = uiState === 'answered'
  const checkHintRef = useRef<HTMLDivElement>(null)
  const targetCount = config.correctOptionIds.length

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
    const evaluation = evaluateFailureModePicker(selected, config.correctOptionIds)
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
          ? 'Можно проверить с частичным баллом'
          : `Выберите наиболее вероятные риски (ориентир: ${targetCount})`
      }
      accentBorder="#DC2626"
    >
      <Box>
        <Text fontSize="xs" color="#F87171" fontWeight="600" mb={2}>
          ДИАГНОСТИКА СЛАБОГО ПРОМПТА — какие сбои вероятны?
        </Text>
        <Text fontSize="lg" fontWeight="600" color="#FFFFFF" mb={4}>
          {config.prompt}
        </Text>
      </Box>

      <Box
        p={4}
        mb={4}
        borderRadius="md"
        borderWidth="2px"
        borderColor="#F87171"
        bg="rgba(127, 29, 29, 0.15)"
      >
        <Text fontSize="xs" color="#F87171" fontWeight="600" mb={2}>
          СЛАБЫЙ ПРОМПТ
        </Text>
        <Text
          color="#FECACA"
          fontSize="md"
          lineHeight="tall"
          fontStyle="italic"
          whiteSpace="pre-wrap"
        >
          {config.weakPrompt}
        </Text>
      </Box>

      <Text fontSize="sm" color="#A1A1AA" mb={3}>
        Отметьте все подходящие режимы сбоя (несколько ответов):
      </Text>

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
