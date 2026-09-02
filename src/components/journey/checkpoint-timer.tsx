import { Box, HStack, Progress, Text } from '@chakra-ui/react'
import { keyframes } from '@emotion/react'
import { formatTimer } from '@/hooks/use-checkpoint-timer'
import { palette } from '@/theme/palette'

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.55; }
`

type CheckpointTimerProps = {
  remainingSec: number
  totalSec: number
  urgent: boolean
  /** Номер вопроса внутри чекпоинта (1-based). */
  questionInBlock?: number
  /** Всего вопросов в текущем чекпоинте. */
  questionsInBlock?: number
}

export function CheckpointTimer({
  remainingSec,
  totalSec,
  urgent,
  questionInBlock,
  questionsInBlock,
}: CheckpointTimerProps) {
  const ratio = totalSec > 0 ? remainingSec / totalSec : 0
  const barColor =
    ratio <= 0.2 ? palette.error : ratio <= 0.4 ? palette.partial : palette.accent
  const labelColor = barColor
  const blockHint =
    questionInBlock !== undefined && questionsInBlock !== undefined
      ? `вопрос ${questionInBlock} из ${questionsInBlock} в блоке`
      : null

  return (
    <Box
      p={4}
      borderRadius="lg"
      borderWidth="1px"
      borderColor={urgent ? palette.error : 'border'}
      bg="bg.card"
      css={
        urgent
          ? {
              animation: `${pulse} 1.1s ease-in-out infinite`,
              '@media (prefers-reduced-motion: reduce)': {
                animation: 'none',
              },
            }
          : undefined
      }
      aria-live="polite"
      aria-label={`Время на блок: ${formatTimer(remainingSec)}${blockHint ? `, ${blockHint}` : ''}`}
    >
      <HStack justify="space-between" mb={2} align="flex-start" gap={3}>
        <Box>
          <Text fontSize="sm" color="fg.muted" fontWeight="600">
            Время на этот блок
          </Text>
          {blockHint && (
            <Text fontSize="xs" color="fg.muted" mt={1}>
              {blockHint}
            </Text>
          )}
        </Box>
        <Text
          fontSize="lg"
          fontWeight="700"
          color={labelColor}
          fontVariantNumeric="tabular-nums"
        >
          {formatTimer(remainingSec)}
        </Text>
      </HStack>
      <Progress.Root value={ratio * 100} size="sm">
        <Progress.Track bg={palette.surfaceElevated} borderRadius="full">
          <Progress.Range bg={barColor} transition="width 0.3s, background 0.3s" />
        </Progress.Track>
      </Progress.Root>
      {urgent && (
        <Text fontSize="xs" color={palette.error} mt={2}>
          Мало времени — отвечайте быстрее
        </Text>
      )}
    </Box>
  )
}
