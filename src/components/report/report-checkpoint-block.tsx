import { Box, Heading, Text } from '@chakra-ui/react'
import type { ReportActivityRow, ReportCheckpointBlock } from '@/utils/build-report'
import { STATUS_LABELS } from '@/utils/build-report'
import { formatUserAnswer } from '@/utils/format-user-answer'
import {
  isClosedActivity,
  isFreeTextActivity,
  isBuildTheBridgeActivity,
} from '@/types/activity'

const statusColor: Record<string, string> = {
  correct: 'accent',
  partial: '#EAB308',
  incorrect: '#F87171',
  timeout: '#F87171',
  skipped: 'fg.muted',
}

function ActivityRow({ row }: { row: ReportActivityRow }) {
  const { activity, result, typeLabel } = row
  const status = result?.status
  const explanation =
    isClosedActivity(activity) && activity.explanation
      ? status === 'correct'
        ? activity.explanation.correct
        : activity.explanation.incorrect
      : undefined
  const modelAnswer =
    isFreeTextActivity(activity) || isBuildTheBridgeActivity(activity)
      ? activity.modelAnswer
      : undefined

  return (
    <Box
      py={3}
      borderBottomWidth="1px"
      borderColor="border"
      _last={{ borderBottomWidth: 0 }}
    >
      <Box
        display="flex"
        justifyContent="space-between"
        gap={3}
        alignItems="baseline"
        mb={1}
      >
        <Text fontSize="sm" color="fg.muted">
          {typeLabel}
        </Text>
        {status ? (
          <Text
            fontSize="sm"
            fontWeight="600"
            color={statusColor[status] ?? 'fg'}
          >
            {STATUS_LABELS[status]}
            {result
              ? ` · ${result.score.toFixed(1)}/${result.maxScore}`
              : ''}
          </Text>
        ) : (
          <Text fontSize="sm" color="fg.muted">
            Нет ответа
          </Text>
        )}
      </Box>
      <Text color="fg" mb={2}>
        {activity.prompt}
      </Text>
      <Text fontSize="sm" color="fg">
        <Text as="span" color="fg.muted">
          Ваш ответ:{' '}
        </Text>
        {formatUserAnswer(result?.userAnswer)}
      </Text>
      {result?.feedback && (
        <Text fontSize="sm" color="fg" mt={1}>
          <Text as="span" color="fg.muted">
            Фидбек:{' '}
          </Text>
          {result.feedback}
        </Text>
      )}
      {explanation && status && status !== 'correct' && (
        <Text fontSize="sm" color="fg.muted" mt={1}>
          Пояснение: {explanation}
        </Text>
      )}
      {modelAnswer && status && status !== 'correct' && (
        <Text fontSize="sm" color="fg.muted" mt={1}>
          Эталон: {modelAnswer}
        </Text>
      )}
    </Box>
  )
}

type Props = {
  block: ReportCheckpointBlock
  index: number
}

export function ReportCheckpointBlockView({ block, index }: Props) {
  const { checkpoint, rows, percent, score, maxScore } = block

  return (
    <Box mb={8} className="report-checkpoint">
      <Heading size="md" color="fg" mb={1}>
        Блок {index + 1}. {checkpoint.title}
      </Heading>
      <Text fontSize="sm" color="fg.muted" mb={3}>
        {checkpoint.concept} · {percent}% ({score.toFixed(1)}/{maxScore})
      </Text>
      <Box>
        {rows.map((row) => (
          <ActivityRow key={row.activity.id} row={row} />
        ))}
      </Box>
    </Box>
  )
}
