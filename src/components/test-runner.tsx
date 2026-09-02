import { Box, Heading, HStack, Progress, Text, VStack } from '@chakra-ui/react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { NavBackLink } from '@/components/nav-back-link'
import type { TopicTest } from '@/content/tests-index'
import { getExerciseById } from '@/content/exercises/index'
import { exerciseRegistry } from '@/components/exercises/exercise-registry'
import { TestResultsSummary } from '@/components/test-results-summary'
import type { ExerciseConfig, ExerciseResult } from '@/types/exercise'
import { answerStatusProgress, palette } from '@/theme/palette'
import { calculateScore } from '@/utils/calculate-score'
import { exerciseTypeLabels, getResultStatus } from '@/utils/get-result-status'
import { recordTestAttempt } from '@/lib/learner'
import { topicFromSlug } from '@/content/topics'

type TestRunnerProps = {
  test: TopicTest
}

type Phase = 'running' | 'finished'

function TestStepIndicator({
  exercises,
  currentIndex,
  awaitingNext,
  results,
}: {
  exercises: ExerciseConfig[]
  currentIndex: number
  awaitingNext: boolean
  results: ExerciseResult[]
}) {
  return (
    <HStack gap={2} flexWrap="wrap" aria-label="Прогресс по вопросам">
      {exercises.map((ex, i) => {
        const done = i < results.length
        const current = i === currentIndex && !awaitingNext
        const answeredCurrent = i === currentIndex && awaitingNext
        const isActive = current || answeredCurrent

        let bg: string = answerStatusProgress.pending.bg
        let border: string = answerStatusProgress.pending.border
        let color: string = answerStatusProgress.pending.color

        if (done) {
          const s = answerStatusProgress[getResultStatus(results[i])]
          bg = s.bg
          border = s.border
          color = s.color
        } else if (isActive) {
          const s = answerStatusProgress.active
          bg = s.bg
          border = s.border
          color = s.color
        }

        return (
          <Box
            key={ex.id}
            title={`Вопрос ${i + 1}: ${exerciseTypeLabels[ex.type]}`}
            w="36px"
            h="36px"
            display="flex"
            alignItems="center"
            justifyContent="center"
            borderRadius="full"
            borderWidth="2px"
            borderColor={border}
            bg={bg}
            fontSize="sm"
            fontWeight="700"
            color={color}
          >
            {i + 1}
          </Box>
        )
      })}
    </HStack>
  )
}

export function TestRunner({ test }: TestRunnerProps) {
  const [phase, setPhase] = useState<Phase>('running')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [results, setResults] = useState<ExerciseResult[]>([])
  const [awaitingNext, setAwaitingNext] = useState(false)
  const startedAt = useRef(0)

  useEffect(() => {
    startedAt.current = Date.now()
  }, [])

  const exercises = useMemo(
    () =>
      test.exerciseIds
        .map((id) => getExerciseById(id))
        .filter((e): e is ExerciseConfig => e !== undefined),
    [test.exerciseIds],
  )

  const current = exercises[currentIndex]
  const summary = useMemo(() => calculateScore(results), [results])

  useEffect(() => {
    if (phase !== 'finished') return
    const mistakes = results
      .filter((r) => !r.isCorrect)
      .map((r) => {
        const ex = exercises.find((e) => e.id === r.exerciseId)
        return { exerciseId: r.exerciseId, prompt: ex?.prompt ?? r.exerciseId }
      })
    recordTestAttempt({
      topicId: topicFromSlug(test.slug),
      percent: summary.percent,
      timeSpentSec: Math.round((Date.now() - startedAt.current) / 1000),
      mistakes,
    })
  }, [phase, results, exercises, summary.percent, test.slug])

  const handleResult = useCallback((result: ExerciseResult) => {
    setResults((prev) => [...prev, result])
    setAwaitingNext(true)
  }, [])

  const handleNext = useCallback(() => {
    setAwaitingNext(false)
    if (currentIndex + 1 >= exercises.length) {
      setPhase('finished')
      return
    }
    setCurrentIndex((i) => i + 1)
  }, [currentIndex, exercises.length])

  if (exercises.length === 0) {
    return (
      <Text color={palette.fg}>
        В тесте нет вопросов.{' '}
        <Link to="/tests" style={{ color: palette.accent }}>
          Назад
        </Link>
      </Text>
    )
  }

  if (phase === 'finished') {
    return (
      <TestResultsSummary
        test={test}
        exercises={exercises}
        results={results}
        summary={summary}
      />
    )
  }

  if (!current) return null

  const Component = exerciseRegistry[current.type]
  const answeredSteps = results.length
  const displayPercent = Math.round(
    ((currentIndex + (awaitingNext ? 1 : 0)) / exercises.length) * 100,
  )

  return (
    <VStack align="stretch" gap={6}>
      <Box>
        <NavBackLink to="/tests" label="Все тесты" />
        <Heading size="2xl" mt={4} mb={2} color={palette.accent}>
          {test.title}
        </Heading>
        <Text color={palette.fgMuted} mb={4}>
          {test.description} · шаг {currentIndex + 1} из {exercises.length}
        </Text>

        <TestStepIndicator
          exercises={exercises}
          currentIndex={currentIndex}
          awaitingNext={awaitingNext}
          results={results}
        />

        <HStack justify="space-between" mt={4} mb={2}>
          <Text fontSize="sm" color={palette.fgMuted}>
            Вопрос {currentIndex + 1} из {exercises.length} ·{' '}
            {exerciseTypeLabels[current.type]}
          </Text>
          <Text fontSize="sm" color={palette.accent} fontWeight="600">
            {displayPercent}%
          </Text>
        </HStack>
        <Progress.Root value={displayPercent} size="sm">
          <Progress.Track bg={palette.surfaceElevated} borderRadius="full">
            <Progress.Range bg={palette.accent} transition="width 0.3s" />
          </Progress.Track>
        </Progress.Root>
        {answeredSteps > 0 && (
          <Text fontSize="xs" color={palette.fgMuted} mt={2}>
            Набрано баллов: {summary.totalScore.toFixed(1)} / {summary.maxScore}
          </Text>
        )}
      </Box>

      <Component
        key={`${current.id}-${currentIndex}`}
        config={current}
        mode="test"
        title={`Шаг ${currentIndex + 1} · ${exerciseTypeLabels[current.type]}`}
        onResult={awaitingNext ? undefined : handleResult}
        onNext={awaitingNext ? handleNext : undefined}
      />
    </VStack>
  )
}
