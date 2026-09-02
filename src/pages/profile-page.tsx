import { Box, Button, Heading, HStack, SimpleGrid, Text, VStack } from '@chakra-ui/react'
import { Link } from 'react-router-dom'
import { LEARNING_TOPICS, TOPIC_LABELS } from '@/content/topics'
import {
  clearLearner,
  exportLearner,
  loadLearner,
  type TopicLevel,
} from '@/lib/learner'
import { useState } from 'react'

const levelLabel: Record<TopicLevel, string> = {
  none: 'ещё не начато',
  weak: 'слабая',
  developing: 'в процессе',
  strong: 'сильная',
}

export function ProfilePage() {
  const [profile, setProfile] = useState(loadLearner)

  const download = () => {
    const blob = new Blob([exportLearner()], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'lab-keeper-learner.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const wipe = () => {
    clearLearner()
    setProfile(loadLearner())
  }

  return (
    <Box>
      <Heading size="3xl" mb={3} color="#84CC16">
        Профиль
      </Heading>
      <Text color="fg.muted" fontSize="lg" mb={8} maxW="65ch">
        Прогресс хранится только в этом браузере. Можно скачать JSON или удалить
        все данные — в индекс корпуса они не попадают.
      </Text>

      <SimpleGrid columns={3} gap={6} mb={10}>
        {LEARNING_TOPICS.map((id) => {
          const t = profile.topics[id]
          return (
            <Box
              key={id}
              p={6}
              borderWidth="1px"
              borderColor="border"
              borderRadius="xl"
              bg="bg.card"
            >
              <Text color="accent" fontSize="sm" mb={2}>
                {levelLabel[t.level]}
              </Text>
              <Heading size="md" mb={3} color="#84CC16">
                {TOPIC_LABELS[id]}
              </Heading>
              <Text color="fg.muted" fontSize="sm">
                Тест: {t.testPercent ?? '—'}%
              </Text>
              <Text color="fg.muted" fontSize="sm">
                Journey: {t.journeyPercent ?? '—'}%
              </Text>
              <Text color="fg.muted" fontSize="sm" mb={3}>
                Время: ~{Math.round(t.timeSpentSec / 60)} мин
              </Text>
              <Link to={`/article/${id}`} style={{ color: '#84CC16' }}>
                К статье →
              </Link>
            </Box>
          )
        })}
      </SimpleGrid>

      <HStack gap={3} mb={8}>
        <Button onClick={download} variant="outline" data-testid="export-profile">
          Экспорт JSON
        </Button>
        <Button
          onClick={wipe}
          variant="outline"
          borderColor="status.error"
          color="status.error"
          data-testid="clear-profile"
        >
          Удалить все данные
        </Button>
      </HStack>

      {profile.recentAsk.length > 0 && (
        <VStack align="stretch" gap={2}>
          <Text fontWeight="600" color="fg.muted">
            Недавние вопросы
          </Text>
          {profile.recentAsk.map((q) => (
            <Text key={q} color="fg">
              {q}
            </Text>
          ))}
        </VStack>
      )}
    </Box>
  )
}
