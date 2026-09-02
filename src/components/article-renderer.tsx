import { Box, Heading, List, Text } from '@chakra-ui/react'
import type { ArticleBlock } from '@/types/article'
import type { ExerciseConfig } from '@/types/exercise'
import { getExerciseById } from '@/content/exercises/index'
import { exerciseRegistry } from '@/components/exercises/exercise-registry'
import { ExplainButton } from '@/components/ai/explain-button'

type ArticleRendererProps = {
  blocks: ArticleBlock[]
  articleTitle?: string
}

const calloutBorder: Record<string, string> = {
  tip: 'accent',
  warning: 'status.error',
  example: 'border',
}

export function ArticleRenderer({ blocks, articleTitle }: ArticleRendererProps) {
  return (
    <Box maxW="65ch" fontSize="lg" lineHeight="tall" color="fg">
      {blocks.map((block, index) => renderBlock(block, index, articleTitle))}
    </Box>
  )
}

function renderBlock(block: ArticleBlock, key: number, articleTitle?: string) {
  switch (block.type) {
    case 'heading': {
      const size = block.level === 1 ? '3xl' : block.level === 2 ? '2xl' : 'xl'
      return (
        <Heading
          key={key}
          as={`h${block.level}`}
          size={size}
          mt={block.level === 1 ? 0 : 10}
          mb={4}
          color="#84CC16"
        >
          {block.text}
        </Heading>
      )
    }
    case 'paragraph':
      return (
        <Box key={key} mb={4}>
          <Text color="fg">{block.text}</Text>
          <ExplainButton passage={block.text} topicTitle={articleTitle} />
        </Box>
      )
    case 'list':
      return (
        <List.Root
          key={key}
          as={block.ordered ? 'ol' : 'ul'}
          pl={6}
          mb={4}
          gap={2}
        >
          {block.items.map((item, i) => (
            <List.Item key={i} color="fg">
              {item}
            </List.Item>
          ))}
        </List.Root>
      )
    case 'callout':
      return (
        <Box
          key={key}
          my={6}
          p={4}
          borderLeftWidth="4px"
          borderLeftColor={calloutBorder[block.variant]}
          bg="bg.card"
          borderRadius="md"
        >
          <Text color="fg.muted">{block.text}</Text>
          <ExplainButton passage={block.text} topicTitle={articleTitle} />
        </Box>
      )
    case 'exercise': {
      const config = getExerciseById(block.exerciseId)
      if (!config) {
        return (
          <Text key={key} color="status.error">
            Упражнение не найдено: {block.exerciseId}
          </Text>
        )
      }
      const Component = exerciseRegistry[config.type]
      return <Component key={key} config={config as ExerciseConfig} mode="inline" />
    }
    default:
      return null
  }
}
