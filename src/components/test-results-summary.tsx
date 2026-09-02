import { Box, Heading, HStack, Text, VStack } from '@chakra-ui/react'
import { Link } from 'react-router-dom'
import type { TopicTest } from '@/content/tests-index'
import type { ExerciseConfig, ExerciseResult } from '@/types/exercise'
import {
  answerStatusStyles,
  palette,
  type AnswerStatus,
} from '@/theme/palette'

const reviewStatusLabels: Record<AnswerStatus, string> = {
  correct: 'Верно',
  partial: 'Частично',
  incorrect: 'Неверно',
}
import {
  exerciseTypeLabels,
  getResultStatus,
} from '@/utils/get-result-status'
import { AiActionPanel } from '@/components/ai/ai-action-panel'
import type { TestScoreSummary } from '@/utils/calculate-score'

type TestResultsSummaryProps = {
  test: TopicTest
  exercises: ExerciseConfig[]
  results: ExerciseResult[]
  summary: TestScoreSummary
}

export function TestResultsSummary({
  test,
  exercises,
  results,
  summary,
}: TestResultsSummaryProps) {
  const partialCount = results.filter((r) => getResultStatus(r) === 'partial').length

  return (
    <VStack align="stretch" gap={8}>
      <Box
        p={8}
        borderRadius="1rem"
        borderWidth="2px"
        borderColor={palette.accent}
        bg={answerStatusStyles.correct.cardBg}
      >
        <Heading size="2xl" mb={4} color={palette.accent}>
          Тест завершён
        </Heading>
        <Text fontSize="3xl" fontWeight="700" color={palette.fg} mb={2}>
          {summary.percent}%
        </Text>
        <Text fontSize="lg" color={palette.fg} mb={4}>
          Баллы: {summary.totalScore.toFixed(1)} из {summary.maxScore} · без ошибок:{' '}
          {summary.correctCount} из {summary.totalQuestions}
          {partialCount > 0 && (
            <Text as="span" color={palette.partial}>
              {' '}
              · частично: {partialCount}
            </Text>
          )}
        </Text>
        <HStack gap={4} flexWrap="wrap">
          <Link
            to={`/article/${test.slug}`}
            style={{ color: palette.accent, textDecoration: 'none', fontWeight: 600 }}
          >
            Перечитать статью →
          </Link>
          <Link to="/tests" style={{ color: palette.fgMuted, textDecoration: 'none' }}>
            Все тесты
          </Link>
        </HStack>
        <AiActionPanel
          defaultQuestion={`Разбор теста «${test.title}»: ${summary.percent}%. Где слабые места и что изучить дальше?`}
        />
      </Box>

      <Box>
        <Heading size="lg" mb={4} color={palette.accent}>
          Разбор по вопросам
        </Heading>
        <VStack align="stretch" gap={4}>
          {exercises.map((exercise, index) => {
            const result = results[index]
            const status = result ? getResultStatus(result) : 'incorrect'
            const styles = answerStatusStyles[status]
            const scoreLabel =
              result && result.maxScore > 0
                ? `${Math.round((result.score / result.maxScore) * 100)}%`
                : '—'

            return (
              <Box
                key={exercise.id}
                p={5}
                borderRadius="lg"
                borderWidth="2px"
                borderColor={styles.color}
                bg={palette.surfaceCard}
              >
                <HStack justify="space-between" align="flex-start" mb={3} gap={4}>
                  <HStack gap={3} align="flex-start">
                    <Text
                      fontSize="xl"
                      fontWeight="700"
                      color={styles.color}
                      lineHeight="1"
                      mt={0.5}
                    >
                      {styles.mark}
                    </Text>
                    <Box>
                      <Text fontSize="sm" color={palette.fgMuted} mb={1}>
                        Вопрос {index + 1} · {exerciseTypeLabels[exercise.type]} ·{' '}
                        {reviewStatusLabels[status]} ({scoreLabel})
                      </Text>
                      <Text fontWeight="600" color={palette.fg}>
                        {exercise.prompt}
                      </Text>
                    </Box>
                  </HStack>
                </HStack>
                <Text fontSize="sm" color={palette.fgMuted} lineHeight="tall">
                  {result && getResultStatus(result) !== 'incorrect'
                    ? exercise.explanation.correct
                    : exercise.explanation.incorrect}
                </Text>
              </Box>
            )
          })}
        </VStack>
      </Box>
    </VStack>
  )
}
