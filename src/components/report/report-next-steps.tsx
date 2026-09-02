import { Box, Button, Text, VStack } from '@chakra-ui/react'
import { useState } from 'react'
import { fetchNextSteps } from '@/api/client'
import { palette } from '@/theme/palette'
import type { JourneyReport } from '@/utils/build-report'
import { buildLocalNextSteps } from '@/utils/next-steps'
import type { NextStepsPayload } from '@/utils/next-steps'

type Props = {
  report: JourneyReport
}

function toApiPayload(report: JourneyReport) {
  return {
    title: report.journey.title,
    sourceSummary: report.journey.sourceSummary,
    percent: report.percent,
    blocks: report.blocks.map((b) => ({
      title: b.checkpoint.title,
      concept: b.checkpoint.concept,
      percent: b.percent,
      weakHints: b.rows
        .map((r) => r.result?.feedback)
        .filter((x): x is string => Boolean(x))
        .slice(0, 3),
    })),
  }
}

export function ReportNextSteps({ report }: Props) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<
    (NextStepsPayload & { source: 'ai' | 'local' }) | null
  >(null)

  const load = () => {
    if (loading) return
    setLoading(true)
    void fetchNextSteps(toApiPayload(report))
      .then((data) => {
        setResult({
          summary: data.summary,
          recommendations: data.recommendations,
          source: data.source ?? 'ai',
        })
      })
      .catch(() => {
        const local = buildLocalNextSteps(report)
        setResult({ ...local, source: 'local' })
      })
      .finally(() => setLoading(false))
  }

  return (
    <Box
      className="no-print"
      mt={8}
      pt={6}
      borderTopWidth="1px"
      borderColor="border"
      data-testid="next-steps"
    >
      <Text
        fontSize="sm"
        fontWeight="600"
        color="fg.muted"
        textTransform="uppercase"
        letterSpacing="0.04em"
        mb={3}
      >
        Дальше
      </Text>

      {!result && (
        <Button
          bg="accent"
          color="#FFFFFF"
          fontWeight="600"
          _hover={{ bg: 'accent.hover', color: '#FFFFFF' }}
          onClick={load}
          disabled={loading}
          data-testid="next-steps-btn"
        >
          {loading ? 'Готовим рекомендации…' : 'Что изучить дальше?'}
        </Button>
      )}

      {result && (
        <VStack align="stretch" gap={4} mt={4}>
          <Text color="fg">{result.summary}</Text>
          {result.recommendations.map((item) => (
            <Box
              key={item.title}
              p={4}
              borderWidth="1px"
              borderColor="border"
              borderRadius="lg"
              borderLeftWidth="3px"
              borderLeftColor="accent"
            >
              <Text fontWeight="700" color="accent" mb={1}>
                {item.title}
              </Text>
              <Text fontSize="sm" color="fg.muted" mb={2}>
                {item.why}
              </Text>
              <Text fontSize="sm" color="fg">
                {item.action}
              </Text>
            </Box>
          ))}
          <Button
            alignSelf="flex-start"
            variant="outline"
            borderColor={palette.accent}
            color={palette.accent}
            onClick={load}
            disabled={loading}
          >
            {loading ? 'Обновляем…' : 'Обновить рекомендации'}
          </Button>
        </VStack>
      )}
    </Box>
  )
}
