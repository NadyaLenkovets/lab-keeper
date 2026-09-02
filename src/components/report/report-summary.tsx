import { Box, Heading, Text } from '@chakra-ui/react'
import { ACHIEVEMENTS } from '@/types/gamification'
import type { JourneyReport } from '@/utils/build-report'

type Props = {
  report: JourneyReport
}

export function ReportSummary({ report }: Props) {
  const { journey, progress, percent, totalScore, maxScore, timeouts } = report
  const achievements = progress?.unlockedAchievements ?? []

  return (
    <Box>
      <Heading size="xl" color="fg" mb={2}>
        Отчёт о путешествии
      </Heading>
      <Text color="fg.muted" mb={4}>
        <Text as="span" color="accent" fontWeight="600">
          {journey.title}
        </Text>
        {' · '}
        {journey.checkpoints.length} блоков · {report.answered}/
        {report.totalActivities} заданий
      </Text>

      <Box
        display="flex"
        flexWrap="wrap"
        gap={6}
        mb={4}
        pb={4}
        borderBottomWidth="1px"
        borderColor="border"
      >
        <Box>
          <Text fontSize="sm" color="fg.muted">
            Результат
          </Text>
          <Text fontSize="2xl" fontWeight="700" color="accent">
            {percent}%
          </Text>
          <Text fontSize="sm" color="fg">
            {totalScore.toFixed(1)} / {maxScore}
          </Text>
        </Box>
        <Box>
          <Text fontSize="sm" color="fg.muted">
            Опыт
          </Text>
          <Text fontSize="2xl" fontWeight="700" color="fg">
            {progress?.xp ?? 0} XP
          </Text>
          <Text fontSize="sm" color="fg">
            серия {progress?.streak ?? 0} · лучшая{' '}
            {progress?.bestStreak ?? 0}
          </Text>
        </Box>
        {timeouts > 0 && (
          <Box>
            <Text fontSize="sm" color="fg.muted">
              Таймауты
            </Text>
            <Text fontSize="2xl" fontWeight="700" color="#F87171">
              {timeouts}
            </Text>
          </Box>
        )}
      </Box>

      {achievements.length > 0 && (
        <Box mb={4}>
          <Text fontSize="sm" color="fg.muted" mb={2}>
            Достижения
          </Text>
          <Box display="flex" flexDirection="column" gap={1}>
            {achievements.map((aid) => (
              <Text key={aid} fontSize="sm" color="accent">
                {ACHIEVEMENTS[aid].title}
                <Text as="span" color="fg.muted">
                  {' — '}
                  {ACHIEVEMENTS[aid].description}
                </Text>
              </Text>
            ))}
          </Box>
        </Box>
      )}

      <Text fontSize="sm" color="fg.muted" mb={6}>
        {journey.sourceSummary}
      </Text>
    </Box>
  )
}
