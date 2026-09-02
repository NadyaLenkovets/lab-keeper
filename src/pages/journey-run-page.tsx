import { Box, Text } from '@chakra-ui/react'
import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { JourneyRunner } from '@/components/journey/journey-runner'
import { getDemoJourney } from '@/content/demo/demo-journey'
import { loadJourney, saveJourney } from '@/store/journey-store'

export function JourneyRunPage() {
  const { id } = useParams<{ id: string }>()

  const journey = useMemo(() => {
    if (!id) return null
    const stored = loadJourney(id)
    if (stored) return stored
    if (id === 'demo') {
      const demo = getDemoJourney()
      saveJourney(demo)
      return demo
    }
    return null
  }, [id])

  if (!journey) {
    return (
      <Box maxW="640px">
        <Text color="fg" mb={3}>
          Journey не найден
        </Text>
        <Text color="fg.muted" mb={4}>
          Начните demo с экрана создания или откройте ссылку /journey/demo.
        </Text>
        <Link to="/create" style={{ color: '#84CC16' }}>
          К созданию
        </Link>
      </Box>
    )
  }

  return <JourneyRunner journey={journey} />
}
