import {
  Box,
  Button,
  Heading,
  HStack,
  Text,
  Textarea,
  VStack,
} from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { NavBackLink } from '@/components/nav-back-link'
import { fetchHealth, type HealthResponse } from '@/api/client'
import { getDemoJourney } from '@/content/demo/demo-journey'
import { saveGenerateDraft } from '@/store/generate-draft'
import {
  createEmptyProgress,
  saveJourney,
  saveProgress,
} from '@/store/journey-store'

export function CreatePage() {
  const navigate = useNavigate()
  const [topic, setTopic] = useState('')
  const [text, setText] = useState('')
  const [size, setSize] = useState<'short' | 'medium'>('short')
  const [health, setHealth] = useState<HealthResponse | null>(null)
  const [healthError, setHealthError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    void fetchHealth()
      .then((h) => {
        if (!cancelled) {
          setHealth(h)
          setHealthError(null)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setHealth(null)
          setHealthError(
            'API недоступен. Запустите npm run dev:server (или dev:all). Demo работает без сервера.',
          )
        }
      })
    return () => {
      cancelled = true
    }
  }, [])

  const startDemo = () => {
    const journey = getDemoJourney()
    saveJourney(journey)
    saveProgress(createEmptyProgress(journey.id))
    void navigate(`/journey/${journey.id}`)
  }

  const canGenerate =
    topic.trim().length >= 3 || text.trim().length >= 40

  const startGenerate = () => {
    if (!canGenerate) return
    saveGenerateDraft({ topic: topic.trim(), text: text.trim(), size })
    void navigate('/generating')
  }

  return (
    <Box maxW="720px">
      <NavBackLink to="/main" label="На главную" />
      <Heading size="2xl" color="fg" mb={3} mt={4}>
        Новое путешествие
      </Heading>
      <Text color="fg.muted" mb={6}>
        Введите тему или вставьте учебный текст. Генерация идёт через сервер
        (OpenRouter). Без ключа доступен demo. Live-генерация опирается на
        статьи и тесты платформы, а не собирает программу «с нуля».
      </Text>

      {healthError && (
        <Box
          mb={4}
          p={3}
          borderRadius="md"
          borderWidth="1px"
          borderColor="#EAB308"
          bg="rgba(234, 179, 8, 0.1)"
        >
          <Text fontSize="sm" color="#EAB308">
            {healthError}
          </Text>
        </Box>
      )}

      {health && !health.modelConfigured && (
        <Box
          mb={4}
          p={3}
          borderRadius="md"
          borderWidth="1px"
          borderColor="#EAB308"
          bg="rgba(234, 179, 8, 0.1)"
        >
          <Text fontSize="sm" color="#EAB308">
            Сервер запущен, но OPENROUTER_API_KEY пуст. Создайте файл .env в корне
            проекта и вставьте ключ. Пока можно пройти demo.
          </Text>
        </Box>
      )}

      {health?.modelConfigured && (
        <Text fontSize="sm" color="accent" mb={4}>
          API готов · модель {health.model}
        </Text>
      )}

      <VStack align="stretch" gap={4}>
        <Box>
          <Text fontSize="sm" color="fg.muted" mb={2}>
            Тема (коротко)
          </Text>
          <Textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Например: галлюцинации больших языковых моделей"
            minH="72px"
            bg="bg.card"
            borderColor="border"
          />
        </Box>

        <Box>
          <Text fontSize="sm" color="fg.muted" mb={2}>
            Или учебный текст
          </Text>
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Вставьте абзац или несколько — система разобьёт на блоки…"
            minH="160px"
            bg="bg.card"
            borderColor="border"
          />
        </Box>

        <Box>
          <Text fontSize="sm" color="fg.muted" mb={2}>
            Длина journey
          </Text>
          <HStack gap={3}>
            <Button
              variant="outline"
              borderColor={size === 'short' ? 'accent' : 'border'}
              bg={size === 'short' ? 'rgba(132, 204, 22, 0.12)' : 'transparent'}
              color="fg"
              onClick={() => setSize('short')}
            >
              Короткий (3 блока)
            </Button>
            <Button
              variant="outline"
              borderColor={size === 'medium' ? 'accent' : 'border'}
              bg={size === 'medium' ? 'rgba(132, 204, 22, 0.12)' : 'transparent'}
              color="fg"
              onClick={() => setSize('medium')}
            >
              Средний (4 блока)
            </Button>
          </HStack>
        </Box>

        <HStack gap={3} flexWrap="wrap" pt={2}>
          <Button
            bg="accent"
            color="#FFFFFF"
            fontWeight="600"
            _hover={{ bg: 'accent.hover', color: '#FFFFFF' }}
            onClick={startGenerate}
            disabled={!canGenerate}
            data-testid="start-generate"
          >
            Сгенерировать journey
          </Button>
          <Button
            variant="outline"
            borderColor="border"
            color="fg"
            onClick={startDemo}
            data-testid="start-demo"
          >
            Пройти demo
          </Button>
        </HStack>

        {!canGenerate && (
          <Text fontSize="sm" color="fg.muted">
            Для генерации: тема ≥ 3 символов или текст ≥ 40 символов.
          </Text>
        )}
      </VStack>
    </Box>
  )
}
