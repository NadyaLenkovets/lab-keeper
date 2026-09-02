import { Box, type BoxProps } from '@chakra-ui/react'
import type { ArticleCover } from '@/content/article-covers'

type ArticleCoverImageProps = {
  cover: ArticleCover
  variant?: 'card' | 'hero'
} & BoxProps

const heights = {
  card: '200px',
  hero: '280px',
} as const

export function ArticleCoverImage({
  cover,
  variant = 'card',
  ...boxProps
}: ArticleCoverImageProps) {
  const height = heights[variant]
  const { Art } = cover

  return (
    <Box
      position="relative"
      w="full"
      h={height}
      overflow="hidden"
      borderRadius={variant === 'card' ? 'card' : 'xl'}
      borderBottomRadius={variant === 'card' ? 0 : undefined}
      bg="#161616"
      role="img"
      aria-label={cover.alt}
      {...boxProps}
    >
      <Art
        width="100%"
        height="100%"
        style={{ display: 'block', minWidth: '100%', minHeight: '100%' }}
      />
      <Box
        position="absolute"
        inset={0}
        bg="linear-gradient(180deg, transparent 40%, rgba(22,22,22,0.85) 100%)"
        pointerEvents="none"
      />
      <Box
        position="absolute"
        inset={0}
        borderWidth="1px"
        borderColor="rgba(132, 204, 22, 0.25)"
        borderRadius="inherit"
        pointerEvents="none"
      />
    </Box>
  )
}
