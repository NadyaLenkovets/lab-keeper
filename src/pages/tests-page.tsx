import { Box, Heading, SimpleGrid, Text } from '@chakra-ui/react'
import { Link } from 'react-router-dom'
import { testsIndex } from '@/content/tests-index'

export function TestsPage() {
  return (
    <Box>
      <Heading size="3xl" mb={4} color="#84CC16">
        Тесты по темам
      </Heading>
      <Text color="fg.muted" fontSize="lg" mb={10} maxW="65ch">
        Здесь можно проверить себя по темам из статей: в каждом тесте — 10
        заданий разного формата. Отвечайте шаг за шагом, следите за прогрессом;
        в конце увидите результат и разбор, где ошиблись.
      </Text>

      <SimpleGrid columns={3} gap={6}>
        {testsIndex.map((test) => (
          <Link
            key={test.slug}
            to={`/tests/${test.slug}`}
            style={{ textDecoration: 'none' }}
          >
            <Box
              p={6}
              h="full"
              bg="bg.card"
              borderRadius="card"
              borderWidth="1px"
              borderColor="border"
              transition="background 0.2s, border-color 0.2s"
              _hover={{ bg: 'bg.elevated', borderColor: '#84CC16' }}
            >
              <Text fontSize="sm" color="#84CC16" mb={2}>
                ~12 мин · 10 заданий
              </Text>
              <Heading size="md" mb={2} color="#84CC16">
                {test.title}
              </Heading>
              <Text color="fg.muted" fontSize="sm">
                {test.description}
              </Text>
            </Box>
          </Link>
        ))}
      </SimpleGrid>
    </Box>
  )
}
