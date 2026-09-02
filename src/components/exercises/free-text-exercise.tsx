import { Box, Text, Textarea } from '@chakra-ui/react'
import { useState } from 'react'
import type { FreeTextActivityConfig, ActivityResult } from '@/types/activity'
import type { ExerciseMode } from '@/types/exercise'
import { useExerciseState } from '@/hooks/use-exercise-state'
import { activityTypeLabel } from '@/utils/journey'
import { gradeOpenActivity } from '@/utils/grade-open-activity'
import { ExerciseShell } from './exercise-shell'

type FreeTextExerciseProps = {
  config: FreeTextActivityConfig
  mode?: ExerciseMode
  title?: string
  onResult?: (result: ActivityResult) => void
  onNext?: () => void
  disabled?: boolean
  useRemoteGrade?: boolean
}

export function FreeTextExercise({
  config,
  mode = 'test',
  title,
  onResult,
  onNext,
  disabled = false,
  useRemoteGrade = false,
}: FreeTextExerciseProps) {
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
      title={title ?? activityTypeLabel(config.type)}
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
          : 'Напишите ответ, затем нажмите «Проверить ответ»'
      }
    >
      <Box>
        <Text fontSize="xs" color="#84CC16" fontWeight="600" mb={2}>
          {activityTypeLabel(config.type).toUpperCase()}
        </Text>
        <Text fontSize="lg" fontWeight="600" color="#FFFFFF" mb={2}>
          {config.prompt}
        </Text>
        <Text fontSize="sm" color="#A1A1AA">
          Концепция: {config.concept}
        </Text>
      </Box>
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        minH="140px"
        bg="#18181B"
        borderColor="#3F3F46"
        color="#FFFFFF"
        placeholder="Ваш ответ…"
        disabled={isAnswered || disabled || checking}
        _focus={{ borderColor: '#84CC16', outline: 'none' }}
      />
    </ExerciseShell>
  )
}
