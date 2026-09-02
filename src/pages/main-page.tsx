import { Box, Heading, SimpleGrid, Text } from '@chakra-ui/react'
import type { SystemStyleObject } from '@chakra-ui/react'
import { keyframes } from '@emotion/react'
import { Link } from 'react-router-dom'
import { ArticleCoverImage } from '@/components/article-cover-image'
import { getArticleCover } from '@/content/article-covers'
import { articlesIndex } from '@/content/articles-index'

const heroTitleReveal = keyframes`
  0% {
    opacity: 0;
    transform: translateY(20px);
    filter: blur(6px);
  }
  40% {
    opacity: 0.35;
  }
  100% {
    opacity: 1;
    transform: translateY(0);
    filter: blur(0);
  }
`

const heroSubtitleReveal = keyframes`
  0% {
    opacity: 0;
    transform: translateY(14px) scale(0.985);
  }
  45% {
    opacity: 0.4;
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
`

const heroTitleMotion: SystemStyleObject = {
  opacity: 0,
  animation: `${heroTitleReveal} 1.75s cubic-bezier(0.33, 1, 0.68, 1) forwards`,
  willChange: 'opacity, transform, filter',
  '@media (prefers-reduced-motion: reduce)': {
    animation: 'none',
    opacity: 1,
    transform: 'none',
    filter: 'none',
    willChange: 'auto',
  },
}

const heroSubtitleMotion: SystemStyleObject = {
  opacity: 0,
  animation: `${heroSubtitleReveal} 1.9s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.9s forwards`,
  willChange: 'opacity, transform',
  '@media (prefers-reduced-motion: reduce)': {
    animation: 'none',
    opacity: 1,
    transform: 'none',
    willChange: 'auto',
  },
}

export function MainPage() {
  return (
    <Box>
      <Box
        position="relative"
        py={16}
        mb={12}
        textAlign="center"
        borderRadius="2xl"
        overflow="hidden"
        bg="#161616"
        borderWidth="1px"
        borderColor="rgba(132, 204, 22, 0.2)"
        _before={{
          content: '""',
          position: 'absolute',
          inset: 0,
          bg: 'radial-gradient(ellipse 120% 100% at 0% 50%, rgba(132, 204, 22, 0.45) 0%, rgba(63, 98, 18, 0.25) 35%, transparent 70%)',
          pointerEvents: 'none',
        }}
        _after={{
          content: '""',
          position: 'absolute',
          inset: 0,
          bg: 'linear-gradient(105deg, rgba(132, 204, 22, 0.35) 0%, rgba(63, 98, 18, 0.2) 40%, rgba(22, 22, 22, 0.95) 78%)',
          pointerEvents: 'none',
        }}
      >
        <Box position="relative" zIndex={1}>
          <Heading
            size="4xl"
            mb={4}
            color="fg"
            fontFamily="'Onest', Inter, system-ui, sans-serif"
            fontWeight="600"
            letterSpacing="-0.03em"
            lineHeight="1.12"
            css={heroTitleMotion}
          >
            Lab Keeper
          </Heading>
          <Text
            fontSize="xl"
            color="fg.muted"
            maxW="640px"
            mx="auto"
            css={heroSubtitleMotion}
          >
            Библиотекарь Prompt Lab: статьи с упражнениями, тесты, journey —
            и поиск по своим материалам, а не общий чат.
          </Text>
        </Box>
      </Box>

      <SimpleGrid columns={3} gap={6}>
        {articlesIndex.map((article) => {
          const cover = getArticleCover(article.slug)
          return (
            <Link
              key={article.slug}
              to={`/article/${article.slug}`}
              style={{ textDecoration: 'none' }}
            >
              <Box
                h="full"
                display="flex"
                flexDirection="column"
                bg="bg.card"
                borderRadius="card"
                borderWidth="1px"
                borderColor="border"
                overflow="hidden"
                transition="border-color 0.2s, box-shadow 0.2s"
                _hover={{
                  borderColor: 'accent',
                  boxShadow: '0 0 0 1px rgba(132, 204, 22, 0.35)',
                }}
              >
                {cover && <ArticleCoverImage cover={cover} variant="card" />}
                <Box p={6} flex={1}>
                  <Text fontSize="sm" color="accent" mb={2}>
                    {article.readingTimeMin} мин · 2 упражнения · разные типы
                  </Text>
                  <Heading size="lg" mb={3} color="#84CC16">
                    {article.title}
                  </Heading>
                  <Text color="fg.muted" fontSize="md">
                    {article.description}
                  </Text>
                </Box>
              </Box>
            </Link>
          )
        })}
      </SimpleGrid>

      <SimpleGrid columns={3} gap={6} mt={10}>
        <Link to="/tests" style={{ textDecoration: 'none' }}>
          <Box p={6} borderWidth="1px" borderColor="border" borderRadius="xl" h="full" _hover={{ borderColor: 'accent' }}>
            <Heading size="md" mb={2} color="#84CC16">Тесты</Heading>
            <Text color="fg.muted">10 шагов по каждой теме, с разбором ошибок.</Text>
          </Box>
        </Link>
        <Link to="/create" style={{ textDecoration: 'none' }}>
          <Box p={6} borderWidth="1px" borderColor="border" borderRadius="xl" h="full" _hover={{ borderColor: 'accent' }}>
            <Heading size="md" mb={2} color="#84CC16">Journey</Heading>
            <Text color="fg.muted">Собрать маршрут из темы с опорой на корпус платформы.</Text>
          </Box>
        </Link>
        <Link to="/ask" style={{ textDecoration: 'none' }}>
          <Box p={6} borderWidth="1px" borderColor="border" borderRadius="xl" h="full" _hover={{ borderColor: 'accent' }}>
            <Heading size="md" mb={2} color="#84CC16">Спросить</Heading>
            <Text color="fg.muted">Ответ с источниками из статей, тестов и journey.</Text>
          </Box>
        </Link>
      </SimpleGrid>
    </Box>
  )
}
