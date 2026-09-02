import { Box, Link, Text, VStack } from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router-dom'
import type { AskSource } from '@/types/rag'

const typeLabel: Record<AskSource['sourceType'], string> = {
  article: 'Статья',
  exercise: 'Упражнение',
  test: 'Тест',
  journey: 'Journey',
}

export function SourceCards({ sources }: { sources: AskSource[] }) {
  if (sources.length === 0) return null
  return (
    <VStack align="stretch" gap={3} mt={4} data-testid="ask-sources">
      <Text fontSize="sm" color="fg.muted" fontWeight="600">
        Источники
      </Text>
      {sources.map((source) => (
        <Box
          key={source.id}
          p={4}
          borderWidth="1px"
          borderColor="border"
          borderRadius="lg"
          borderLeftWidth="3px"
          borderLeftColor="accent"
        >
          <Text fontSize="xs" color="accent" mb={1}>
            {typeLabel[source.sourceType]}
          </Text>
          <Link asChild color="accent" fontWeight="600">
            <RouterLink to={source.url}>{source.title}</RouterLink>
          </Link>
          <Text fontSize="sm" color="fg.muted" mt={2}>
            {source.snippet}
          </Text>
        </Box>
      ))}
    </VStack>
  )
}
