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
import { askPlatform, fetchHealth, type HealthResponse } from '@/api/client'
import { SourceCards } from '@/components/ai/source-cards'
import { compactLearnerSummary, recordAskQuestion } from '@/lib/learner'
import type { AskAction, AskResponse } from '@/types/rag'

const presets: Array<{ action: AskAction; label: string; question: string }> = [
  {
    action: 'ask',
    label: 'Спроси платформу',
    question: 'Что я знаю о галлюцинациях?',
  },
  {
    action: 'explain',
    label: 'Объясни проще',
    question: 'Объясни простыми словами, что такое галлюцинация LLM',
  },
  {
    action: 'analyze',
    label: 'Слабые места',
    question: 'В чём мои слабые места на платформе?',
  },
  {
    action: 'recommend',
    label: 'Что дальше',
    question: 'Что мне изучить дальше?',
  },
  {
    action: 'relate',
    label: 'Как связано',
    question: 'Как галлюцинации связаны со структурой промпта?',
  },
]

export function AskPage() {
  const [question, setQuestion] = useState('Что я знаю о галлюцинациях?')
  const [action, setAction] = useState<AskAction>('ask')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AskResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [health, setHealth] = useState<HealthResponse | null>(null)

  useEffect(() => {
    void fetchHealth()
      .then(setHealth)
      .catch(() => setHealth(null))
  }, [])

  const run = () => {
    const q = question.trim()
    if (q.length < 3 || loading) return
    setLoading(true)
    setError(null)
    recordAskQuestion(q)
    void askPlatform({
      action,
      question: q,
      learnerSummary: compactLearnerSummary(),
    })
      .then(setResult)
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Не удалось спросить платформу')
      })
      .finally(() => setLoading(false))
  }

  return (
    <Box maxW="760px">
      <Heading size="3xl" mb={3} color="#84CC16">
        Спроси платформу
      </Heading>
      <Text color="fg.muted" fontSize="lg" mb={4}>
        Lab Keeper ищет ответ в статьях, тестах и journey. Источники показываются
        отдельно — это не общий чат.
      </Text>
      {health && (
        <Text fontSize="sm" color="accent" mb={6} data-testid="rag-index-status">
          Индекс: {health.ragChunks ?? 0} чанков, векторы:{' '}
          {health.ragVectors && health.ragVectors > 0
            ? `${health.ragVectors} (${health.ragModel})`
            : 'нет, только слова'}
        </Text>
      )}

      <HStack gap={2} flexWrap="wrap" mb={4}>
        {presets.map((p) => (
          <Button
            key={p.action}
            size="sm"
            variant="outline"
            borderColor={action === p.action ? 'accent' : 'border'}
            color={action === p.action ? 'accent' : 'fg.muted'}
            onClick={() => {
              setAction(p.action)
              setQuestion(p.question)
            }}
            data-testid={`preset-${p.action}`}
          >
            {p.label}
          </Button>
        ))}
      </HStack>

      <Textarea
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        minH="120px"
        mb={4}
        data-testid="ask-input"
      />
      <Button
        bg="accent"
        color="#FFFFFF"
        fontWeight="600"
        _hover={{ bg: 'accent.hover', color: '#FFFFFF' }}
        onClick={run}
        disabled={loading || question.trim().length < 3}
        data-testid="ask-submit"
      >
        {loading ? 'Ищу в корпусе…' : 'Спросить'}
      </Button>

      {error && (
        <Text color="status.error" mt={4}>
          {error}
        </Text>
      )}

      {result && (
        <VStack align="stretch" gap={4} mt={8} data-testid="ask-result">
          <Text whiteSpace="pre-wrap" color="fg" fontSize="lg">
            {result.answer}
          </Text>
          <SourceCards sources={result.sources} />
        </VStack>
      )}
    </Box>
  )
}
