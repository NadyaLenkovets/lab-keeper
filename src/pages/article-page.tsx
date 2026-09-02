import { Badge, Box, Heading, Text, VStack } from '@chakra-ui/react'
import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { NavBackLink } from '@/components/nav-back-link'
import { ArticleCoverImage } from '@/components/article-cover-image'
import { ArticleRenderer } from '@/components/article-renderer'
import { getArticleCover } from '@/content/article-covers'
import { getArticleBySlug } from '@/utils/get-article-by-slug'
import { recordArticleOpen } from '@/lib/learner'
import { topicFromSlug } from '@/content/topics'

export function ArticlePage() {
  const { slug } = useParams<{ slug: string }>()
  const article = slug ? getArticleBySlug(slug) : undefined

  useEffect(() => {
    if (article) recordArticleOpen(topicFromSlug(article.slug))
  }, [article])

  if (!article) {
    return (
      <Text color="fg">
        Статья не найдена.{' '}
        <Link to="/main" style={{ color: '#84CC16' }}>
          На главную
        </Link>
      </Text>
    )
  }

  const cover = getArticleCover(article.slug)

  return (
    <VStack align="stretch" gap={0}>
      <Box mb={4}>
        <NavBackLink to="/main" label="Все статьи" />
      </Box>
      {cover && (
        <ArticleCoverImage cover={cover} variant="hero" mb={6} borderRadius="xl" />
      )}
      <Badge
        alignSelf="flex-start"
        mb={2}
        color="accent"
        borderColor="accent"
        variant="outline"
      >
        {article.readingTimeMin} мин чтения
      </Badge>
      <Heading as="h1" size="3xl" mb={3} color="#84CC16">
        {article.title}
      </Heading>
      <Text color="fg.muted" mb={10} fontSize="lg">
        {article.description}
      </Text>
      <ArticleRenderer blocks={article.blocks} articleTitle={article.title} />
    </VStack>
  )
}
