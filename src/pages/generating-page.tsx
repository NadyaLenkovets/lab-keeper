import { Box, Button, Heading, Text } from '@chakra-ui/react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { NavBackLink } from '@/components/nav-back-link'
import { ApiError, generateJourneyOnce } from '@/api/client'
import { getDemoJourney } from '@/content/demo/demo-journey'
import {
  clearGenerateDraft,
  loadGenerateDraft,
} from '@/store/generate-draft'
import {
  createEmptyProgress,
  saveJourney,
  saveProgress,
} from '@/store/journey-store'

type RunState =
  | { kind: 'missing-draft' }
  | { kind: 'loading' }
  | { kind: 'error'; message: string }

export function GeneratingPage() {
  const navigate = useNavigate()
  const draft = useMemo(() => loadGenerateDraft(), [])
  const hasDraft = Boolean(draft && (draft.topic || draft.text))

  const [run, setRun] = useState<RunState>(() =>
    hasDraft ? { kind: 'loading' } : { kind: 'missing-draft' },
  )

  const startDemo = () => {
    clearGenerateDraft()
    const journey = getDemoJourney()
    saveJourney(journey)
    saveProgress(createEmptyProgress(journey.id))
    void navigate(`/journey/${journey.id}`)
  }

  useEffect(() => {
    if (!hasDraft || !draft) return

    let cancelled = false

    void generateJourneyOnce({
      topic: draft.topic || undefined,
      text: draft.text || undefined,
      size: draft.size,
    })
      .then((journey) => {
        if (cancelled) return
        clearGenerateDraft()
        saveJourney(journey)
        saveProgress(createEmptyProgress(journey.id))
        void navigate(`/journey/${journey.id}`, { replace: true })
      })
      .catch((err: unknown) => {
        if (cancelled) return
        const message =
          err instanceof ApiError
            ? err.message
            : err instanceof Error
              ? err.message
              : 'Не удалось сгенерировать journey'
        setRun({ kind: 'error', message })
      })

    return () => {
      cancelled = true
    }
  }, [draft, hasDraft, navigate])

  return (
    <Box maxW="640px" mx="auto" textAlign="center" py={16}>
      <NavBackLink to="/create" label="Назад к созданию" />
      <Box mt={8}>
        {run.kind === 'loading' && (
          <>
            <Heading size="xl" color="fg" mb={4}>
              Генерация journey…
            </Heading>
            <Text color="fg.muted">
              Разбираем материал на смысловые блоки и собираем задания.
              Free-модели OpenRouter могут отвечать 20–60 секунд.
            </Text>
          </>
        )}

        {run.kind === 'missing-draft' && (
          <>
            <Heading size="xl" color="fg" mb={4}>
              Нет данных для генерации
            </Heading>
            <Text color="fg.muted" mb={4}>
              Вернитесь на экран создания и введите тему или текст.
            </Text>
            <Button
              bg="accent"
              color="#FFFFFF"
              fontWeight="600"
              _hover={{ bg: 'accent.hover', color: '#FFFFFF' }}
              onClick={() => void navigate('/create')}
            >
              К созданию
            </Button>
          </>
        )}

        {run.kind === 'error' && (
          <>
            <Heading size="xl" color="fg" mb={4}>
              Не удалось сгенерировать
            </Heading>
            <Text color="#F87171" mb={3}>
              {run.message}
            </Text>
            <Text color="fg.muted" fontSize="sm" mb={4}>
              Можно открыть готовый demo без API или попробовать снова с экрана
              создания.
            </Text>
            <Box display="flex" gap={3} justifyContent="center" flexWrap="wrap">
              <Button
                bg="accent"
                color="#FFFFFF"
                fontWeight="600"
                _hover={{ bg: 'accent.hover', color: '#FFFFFF' }}
                onClick={startDemo}
                data-testid="fallback-demo"
              >
                Открыть demo
              </Button>
              <Button
                variant="outline"
                borderColor="border"
                color="fg"
                onClick={() => void navigate('/create')}
              >
                Изменить ввод
              </Button>
            </Box>
          </>
        )}
      </Box>
    </Box>
  )
}
