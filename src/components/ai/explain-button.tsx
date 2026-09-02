import { Box, Button, Text } from '@chakra-ui/react'
import { useState } from 'react'
import { askPlatform } from '@/api/client'
import { compactLearnerSummary } from '@/lib/learner'
import { SourceCards } from '@/components/ai/source-cards'
import type { AskResponse } from '@/types/rag'

type Props = {
  passage: string
  topicTitle?: string
}

export function ExplainButton({ passage, topicTitle }: Props) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AskResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const run = () => {
    if (loading) return
    setLoading(true)
    setError(null)
    void askPlatform({
      action: 'explain',
      question: `Объясни проще: ${topicTitle ?? 'этот фрагмент'}`,
      passage,
      learnerSummary: compactLearnerSummary(),
    })
      .then(setResult)
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Не удалось объяснить')
      })
      .finally(() => setLoading(false))
  }

  return (
    <Box my={2} data-testid="explain-block">
      <Button
        size="sm"
        variant="outline"
        borderColor="accent"
        color="accent"
        onClick={run}
        disabled={loading}
        data-testid="explain-btn"
      >
        {loading ? 'Объясняю…' : 'Объясни проще'}
      </Button>
      {error && (
        <Text color="status.error" fontSize="sm" mt={2}>
          {error}
        </Text>
      )}
      {result && (
        <Box
          mt={3}
          p={4}
          borderRadius="md"
          borderWidth="1px"
          borderColor="accent"
          bg="bg.card"
        >
          <Text whiteSpace="pre-wrap" color="fg">
            {result.answer}
          </Text>
          <SourceCards sources={result.sources} />
        </Box>
      )}
    </Box>
  )
}
