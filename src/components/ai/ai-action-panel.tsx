import { Box, Button, HStack, Text, VStack } from '@chakra-ui/react'
import { useState } from 'react'
import { askPlatform } from '@/api/client'
import { compactLearnerSummary } from '@/lib/learner'
import { SourceCards } from '@/components/ai/source-cards'
import type { AskAction, AskResponse } from '@/types/rag'

type Props = {
  defaultQuestion: string
  actions?: Array<{ id: AskAction; label: string }>
}

export function AiActionPanel({ defaultQuestion, actions }: Props) {
  const [loading, setLoading] = useState<AskAction | null>(null)
  const [result, setResult] = useState<AskResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const items = actions ?? [
    { id: 'analyze' as const, label: 'В чём слабые места?' },
    { id: 'recommend' as const, label: 'Что изучить дальше?' },
  ]

  const run = (action: AskAction) => {
    if (loading) return
    setLoading(action)
    setError(null)
    void askPlatform({
      action,
      question: defaultQuestion,
      learnerSummary: compactLearnerSummary(),
    })
      .then(setResult)
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Не удалось получить ответ')
      })
      .finally(() => setLoading(null))
  }

  return (
    <Box mt={6} data-testid="ai-action-panel">
      <HStack gap={3} flexWrap="wrap">
        {items.map((item) => (
          <Button
            key={item.id}
            bg="accent"
            color="#FFFFFF"
            fontWeight="600"
            _hover={{ bg: 'accent.hover', color: '#FFFFFF' }}
            onClick={() => run(item.id)}
            disabled={Boolean(loading)}
            data-testid={`ai-action-${item.id}`}
          >
            {loading === item.id ? 'Думаю…' : item.label}
          </Button>
        ))}
      </HStack>
      {error && (
        <Text color="status.error" mt={3}>
          {error}
        </Text>
      )}
      {result && (
        <VStack align="stretch" gap={3} mt={4}>
          <Text whiteSpace="pre-wrap" color="fg">
            {result.answer}
          </Text>
          <SourceCards sources={result.sources} />
        </VStack>
      )}
    </Box>
  )
}
