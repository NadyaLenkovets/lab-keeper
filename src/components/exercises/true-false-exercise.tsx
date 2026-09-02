import { Box, HStack, Text } from '@chakra-ui/react'
import { useState } from 'react'
import type { BaseExerciseProps, TrueFalseExerciseConfig } from '@/types/exercise'
import { evaluateTrueFalse } from '@/utils/evaluate-true-false'
import { useExerciseState } from '@/hooks/use-exercise-state'
import { ExerciseShell } from './exercise-shell'

export function TrueFalseExercise({
  config,
  mode = 'inline',
  title,
  onResult,
  onNext,
}: BaseExerciseProps<TrueFalseExerciseConfig>) {
  const [answer, setAnswer] = useState<boolean | null>(null)
  const { uiState, result, submit } = useExerciseState(onResult)
  const isAnswered = uiState === 'answered'

  const handleCheck = () => {
    const evaluation = evaluateTrueFalse(answer, config.correctAnswer)
    submit({
      exerciseId: config.id,
      isCorrect: evaluation.isCorrect,
      score: evaluation.score,
      maxScore: evaluation.maxScore,
      userAnswer: answer,
    })
  }

  const getChoiceStyles = (value: boolean) => {
    const isSelected = answer === value
    if (!isAnswered) {
      return {
        borderColor: isSelected ? '#84CC16' : '#3F3F46',
        bg: isSelected ? '#27272A' : 'transparent',
        color: '#FFFFFF',
      }
    }
    const isCorrectChoice = value === config.correctAnswer
    if (isCorrectChoice) {
      return {
        borderColor: '#84CC16',
        bg: 'rgba(132, 204, 22, 0.2)',
        color: '#FFFFFF',
      }
    }
    if (isSelected && !isCorrectChoice) {
      return {
        borderColor: '#F87171',
        bg: 'rgba(248, 113, 113, 0.15)',
        color: '#FFFFFF',
      }
    }
    return {
      borderColor: '#3F3F46',
      bg: 'transparent',
      color: '#A1A1AA',
    }
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
      canCheck={answer !== null}
      accentBorder="#3F6212"
    >
      <Box>
        <Text fontSize="xs" color="#84CC16" fontWeight="600" mb={2}>
          ВЕРНО ИЛИ НЕВЕРНО
        </Text>
        <Text fontSize="lg" fontWeight="600" color="#FFFFFF">
          {config.prompt}
        </Text>
      </Box>
      <HStack gap={4} role="radiogroup" aria-label={config.prompt}>
        {([true, false] as const).map((value) => {
          const label = value ? 'Верно' : 'Неверно'
          const styles = getChoiceStyles(value)
          const showMark =
            isAnswered &&
            (value === config.correctAnswer ||
              (answer === value && value !== config.correctAnswer))

          return (
            <Box
              key={String(value)}
              as="button"
              role="radio"
              aria-checked={answer === value}
              flex={1}
              px={6}
              py={4}
              borderRadius="md"
              borderWidth="2px"
              borderColor={styles.borderColor}
              bg={styles.bg}
              color={styles.color}
              fontWeight="600"
              cursor={isAnswered ? 'default' : 'pointer'}
              onClick={() => !isAnswered && setAnswer(value)}
              _hover={isAnswered ? {} : { borderColor: '#84CC16' }}
            >
              <HStack justify="center" gap={2}>
                {showMark && (
                  <Text color={value === config.correctAnswer ? '#84CC16' : '#F87171'}>
                    {value === config.correctAnswer ? '✓' : '✗'}
                  </Text>
                )}
                <Text>{label}</Text>
              </HStack>
            </Box>
          )
        })}
      </HStack>
    </ExerciseShell>
  )
}
