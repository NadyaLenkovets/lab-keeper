import { Box, HStack, Text, Textarea } from '@chakra-ui/react'
import { useState } from 'react'
import type {
  ActivityResult,
  BuildTheBridgeActivityConfig,
} from '@/types/activity'
import type { ExerciseMode } from '@/types/exercise'
import { useExerciseState } from '@/hooks/use-exercise-state'
import { gradeOpenActivity } from '@/utils/grade-open-activity'
import { ExerciseShell } from './exercise-shell'

type BuildTheBridgeExerciseProps = {
  config: BuildTheBridgeActivityConfig
  mode?: ExerciseMode
  title?: string
  onResult?: (result: ActivityResult) => void
  onNext?: () => void
  disabled?: boolean
  useRemoteGrade?: boolean
}

export function BuildTheBridgeExercise({
  config,
  mode = 'test',
  title,
  onResult,
  onNext,
  disabled = false,
  useRemoteGrade = false,
}: BuildTheBridgeExerciseProps) {
  const [text, setText] = useState('')
  const [feedback, setFeedback] = useState<string | null>(null)
  const [checking, setChecking] = useState(false)
  const { uiState, result, submit } = useExerciseState()
  const isAnswered = uiState === 'answered'

  const handleCheck = () => {
    if (checking || isAnswered) return
    setChecking(true)
    void gradeOpenActivity(config, text, { useRemote: useRemoteGrade })
      .then((graded) => {
        setFeedback(graded.feedback ?? null)
        submit({
          exerciseId: config.id,
          isCorrect: graded.status === 'correct',
          score: graded.score,
          maxScore: graded.maxScore,
          userAnswer: text,
        })
        onResult?.(graded)
      })
      .finally(() => setChecking(false))
  }

  return (
    <ExerciseShell
      mode={mode}
      title={title ?? 'Связь концепций'}
      onNext={onNext}
      uiState={uiState}
      isCorrect={result?.isCorrect ?? null}
      score={result?.score}
      maxScore={result?.maxScore}
      explanation={null}
      feedbackMessage={feedback}
      referenceAnswer={config.modelAnswer}
      onCheck={handleCheck}
      canCheck={text.trim().length > 0 && !checking}
      hint={config.hint}
      disabled={disabled}
      accentBorder="#84CC16"
      checkHint={
        checking
          ? 'Оцениваем ответ…'
          : 'Опишите связь одной–двумя фразами, затем проверьте ответ'
      }
    >
      <Box>
        <Text fontSize="xs" color="#84CC16" fontWeight="600" mb={2}>
          СВЯЗЬ КОНЦЕПЦИЙ
        </Text>
        <Text fontSize="lg" fontWeight="600" color="#FFFFFF" mb={4}>
          {config.prompt}
        </Text>
        <HStack gap={4} flexWrap="wrap" mb={2}>
          <Box
            flex="1"
            minW="200px"
            p={4}
            borderRadius="lg"
            borderWidth="1px"
            borderColor="#3F3F46"
            bg="#18181B"
          >
            <Text fontSize="sm" color="#A1A1AA" mb={1}>
              Концепция A
            </Text>
            <Text color="#84CC16" fontWeight="600">
              {config.conceptA}
            </Text>
          </Box>
          <Box
            flex="1"
            minW="200px"
            p={4}
            borderRadius="lg"
            borderWidth="1px"
            borderColor="#3F3F46"
            bg="#18181B"
          >
            <Text fontSize="sm" color="#A1A1AA" mb={1}>
              Концепция B
            </Text>
            <Text color="#84CC16" fontWeight="600">
              {config.conceptB}
            </Text>
          </Box>
        </HStack>
      </Box>
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        minH="120px"
        bg="#18181B"
        borderColor="#3F3F46"
        color="#FFFFFF"
        placeholder="Как связаны эти концепции…"
        disabled={isAnswered || disabled || checking}
        _focus={{ borderColor: '#84CC16', outline: 'none' }}
      />
    </ExerciseShell>
  )
}
