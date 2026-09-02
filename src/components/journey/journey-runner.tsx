import { Box, Heading, HStack, Progress, Text, VStack } from '@chakra-ui/react'
import { useEffect, useMemo, useReducer } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ActivityStep } from '@/components/journey/activity-step'
import { CheckpointTimer } from '@/components/journey/checkpoint-timer'
import { XpBar } from '@/components/journey/xp-bar'
import { NavBackLink } from '@/components/nav-back-link'
import { useCheckpointTimer } from '@/hooks/use-checkpoint-timer'
import type { ActivityResult } from '@/types/activity'
import type { Journey } from '@/types/journey'
import { answerStatusProgress, palette } from '@/theme/palette'
import { saveProgress } from '@/store/journey-store'
import { flattenJourney, activityTypeLabel } from '@/utils/journey'
import {
  createJourneyRunState,
  journeyRunReducer,
} from '@/utils/journey-run-reducer'

type JourneyRunnerProps = {
  journey: Journey
}

function statusFromResult(
  result: ActivityResult,
): keyof typeof answerStatusProgress {
  if (result.status === 'correct') return 'correct'
  if (result.status === 'partial') return 'partial'
  return 'incorrect'
}

type TimerSlotProps = {
  timeLimitSec: number
  paused: boolean
  enabled: boolean
  onExpire: () => void
  questionInBlock: number
  questionsInBlock: number
}

function CheckpointTimerSlot({
  timeLimitSec,
  paused,
  enabled,
  onExpire,
  questionInBlock,
  questionsInBlock,
}: TimerSlotProps) {
  const { remainingSec, urgent, totalSec } = useCheckpointTimer({
    timeLimitSec,
    paused,
    enabled,
    onExpire,
  })

  return (
    <CheckpointTimer
      remainingSec={remainingSec}
      totalSec={totalSec}
      urgent={urgent}
      questionInBlock={questionInBlock}
      questionsInBlock={questionsInBlock}
    />
  )
}

export function JourneyRunner({ journey }: JourneyRunnerProps) {
  const navigate = useNavigate()
  const steps = useMemo(() => flattenJourney(journey), [journey])
  const [state, dispatch] = useReducer(
    journeyRunReducer,
    undefined,
    createJourneyRunState,
  )

  const current = steps[state.currentIndex]
  const totalScore = state.results.reduce((s, r) => s + r.score, 0)
  const maxScore = state.results.reduce((s, r) => s + r.maxScore, 0)

  useEffect(() => {
    saveProgress({
      journeyId: journey.id,
      results: state.results,
      currentFlatIndex: state.currentIndex,
      completed: state.phase === 'finished',
      updatedAt: new Date().toISOString(),
      xp: state.game.xp,
      streak: state.game.streak,
      bestStreak: state.game.bestStreak,
      unlockedAchievements: state.game.unlockedAchievements,
    })
  }, [journey.id, state])

  if (steps.length === 0) {
    return (
      <Box>
        <Text color="fg.muted">В journey нет активностей.</Text>
        <Link to="/main">На главную</Link>
      </Box>
    )
  }

  if (state.phase === 'finished') {
    const percent =
      maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0
    return (
      <VStack align="stretch" gap={6} maxW="720px">
        <NavBackLink to="/main" label="На главную" />
        <Heading size="xl" color="fg">
          Journey завершён
        </Heading>
        <Text color="fg.muted">
          {journey.title}: {percent}% · {totalScore.toFixed(1)} / {maxScore}{' '}
          баллов · {state.results.length} заданий · {state.game.xp} XP
        </Text>
        <XpBar state={state.game} />
        <Box
          as="button"
          data-testid="go-to-report"
          onClick={() => void navigate(`/journey/${journey.id}/report`)}
          alignSelf="flex-start"
          px={5}
          py={3}
          borderRadius="lg"
          bg="accent"
          color="#FFFFFF"
          fontWeight="600"
          cursor="pointer"
          border="none"
          _hover={{ bg: 'accent.hover' }}
        >
          К отчёту →
        </Box>
      </VStack>
    )
  }

  if (!current) return null

  const questionsInBlock = steps.filter(
    (s) => s.checkpointIndex === current.checkpointIndex,
  ).length
  const questionInBlock = current.activityIndex + 1

  const displayPercent = Math.round(
    ((state.currentIndex + (state.awaitingNext ? 1 : 0)) / steps.length) * 100,
  )

  return (
    <VStack align="stretch" gap={6} maxW="800px">
      <NavBackLink to="/create" label="К созданию" />

      <Box>
        <Text fontSize="sm" color="accent" mb={1}>
          Блок {current.checkpointIndex + 1} из {journey.checkpoints.length}:{' '}
          {current.checkpoint.title}
        </Text>
        <Heading size="lg" color="fg" mb={2}>
          {journey.title}
        </Heading>
        {journey.origin === 'ai' && (
          <Text fontSize="sm" color="accent" mb={2} data-testid="origin-ai">
            Сгенерировано AI по корпусу платформы
          </Text>
        )}
        {journey.origin === 'demo' && (
          <Text fontSize="sm" color="fg.muted" mb={2}>
            Демо-маршрут (написан человеком)
          </Text>
        )}
        <Text color="fg.muted" fontSize="sm">
          {current.checkpoint.concept}
        </Text>
        <Text color="fg.muted" fontSize="sm" mt={1}>
          Вопрос {questionInBlock} из {questionsInBlock} в этом блоке · шаг{' '}
          {state.currentIndex + 1} из {steps.length} в путешествии ·{' '}
          {activityTypeLabel(current.activity.type)}
        </Text>
      </Box>

      <XpBar state={state.game} />

      <CheckpointTimerSlot
        key={current.checkpoint.id}
        timeLimitSec={current.checkpoint.timeLimitSec}
        paused={state.awaitingNext}
        enabled={state.phase === 'running'}
        onExpire={() => dispatch({ type: 'timeout', steps })}
        questionInBlock={questionInBlock}
        questionsInBlock={questionsInBlock}
      />

      <HStack gap={2} flexWrap="wrap" aria-label="Прогресс по шагам">
        {steps.map((step, i) => {
          const done = state.results.some(
            (r) => r.activityId === step.activity.id,
          )
          let bg: string = answerStatusProgress.pending.bg
          let border: string = answerStatusProgress.pending.border
          let color: string = answerStatusProgress.pending.color
          if (done) {
            const result = state.results.find(
              (r) => r.activityId === step.activity.id,
            )
            if (result) {
              const s = answerStatusProgress[statusFromResult(result)]
              bg = s.bg
              border = s.border
              color = s.color
            }
          } else if (i === state.currentIndex) {
            const s = answerStatusProgress.active
            bg = s.bg
            border = s.border
            color = s.color
          }
          return (
            <Box
              key={step.activity.id}
              w="32px"
              h="32px"
              display="flex"
              alignItems="center"
              justifyContent="center"
              borderRadius="full"
              borderWidth="2px"
              borderColor={border}
              bg={bg}
              fontSize="xs"
              fontWeight="700"
              color={color}
              title={activityTypeLabel(step.activity.type)}
            >
              {i + 1}
            </Box>
          )
        })}
      </HStack>

      <Box>
        <HStack justify="space-between" mb={2}>
          <Text fontSize="sm" color="fg.muted">
            Прогресс
          </Text>
          <Text fontSize="sm" color="fg.muted">
            {displayPercent}%
          </Text>
        </HStack>
        <Progress.Root value={displayPercent} size="sm">
          <Progress.Track bg={palette.surfaceElevated} borderRadius="full">
            <Progress.Range bg={palette.accent} transition="width 0.3s" />
          </Progress.Track>
        </Progress.Root>
        {state.results.length > 0 && (
          <Text fontSize="sm" color="fg.muted" mt={2}>
            Набрано: {totalScore.toFixed(1)} / {maxScore}
          </Text>
        )}
      </Box>

      <Box>
        <ActivityStep
          key={current.activity.id}
          activity={current.activity}
          onResult={(result) => dispatch({ type: 'result', result, steps })}
          onNext={() => dispatch({ type: 'next', steps })}
          disabled={state.timedOut}
          useRemoteGrade={journey.id !== 'demo'}
        />
      </Box>
    </VStack>
  )
}
