import { Input, Text, VStack } from '@chakra-ui/react'
import { useState } from 'react'
import type { BaseExerciseProps, FillTheBlankExerciseConfig } from '@/types/exercise'
import { evaluateFillTheBlank } from '@/utils/evaluate-fill-the-blank'
import { useExerciseState } from '@/hooks/use-exercise-state'
import { ExerciseShell } from './exercise-shell'

export function FillTheBlankExercise({
  config,
  mode = 'inline',
  title,
  onResult,
  onNext,
}: BaseExerciseProps<FillTheBlankExerciseConfig>) {
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const { uiState, result, submit } = useExerciseState(onResult)
  const isAnswered = uiState === 'answered'
  const isCorrect = result?.isCorrect ?? false

  const handleCheck = () => {
    const evaluation = evaluateFillTheBlank(answers, config.blanks)
    submit({
      exerciseId: config.id,
      isCorrect: evaluation.isCorrect,
      score: evaluation.score,
      maxScore: evaluation.maxScore,
      userAnswer: answers,
    })
  }

  const canCheck = config.blanks.every((b) => (answers[b.id] ?? '').trim().length > 0)

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
      canCheck={canCheck}
      accentBorder="#65A30D"
    >
      <Text fontSize="lg" fontWeight="600" color="fg">
        {config.prompt}
      </Text>
      <VStack align="stretch" gap={3}>
        {config.blanks.map((blank, index) => (
          <Input
            key={blank.id}
            data-testid={`fill-blank-${blank.id}`}
            placeholder={`Пропуск ${index + 1}`}
            value={answers[blank.id] ?? ''}
            onChange={(e) =>
              setAnswers((prev) => ({ ...prev, [blank.id]: e.target.value }))
            }
            disabled={isAnswered}
            bg="bg.elevated"
            borderWidth="2px"
            borderColor={
              isAnswered
                ? isCorrect
                  ? 'accent'
                  : 'status.error'
                : 'border'
            }
            color="fg"
            _focusVisible={{ borderColor: 'accent', boxShadow: 'none' }}
          />
        ))}
      </VStack>
    </ExerciseShell>
  )
}
