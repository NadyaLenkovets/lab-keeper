import { Box, Text } from '@chakra-ui/react'
import { useState } from 'react'
import type { BaseExerciseProps, SpotTheHallucinationExerciseConfig } from '@/types/exercise'
import { evaluateSpotTheHallucination } from '@/utils/evaluate-spot-the-hallucination'
import { useExerciseState } from '@/hooks/use-exercise-state'
import { ExerciseShell } from './exercise-shell'

export function SpotTheHallucinationExercise({
  config,
  mode = 'inline',
  title,
  onResult,
  onNext,
}: BaseExerciseProps<SpotTheHallucinationExerciseConfig>) {
  const [selected, setSelected] = useState<string[]>([])
  const { uiState, result, submit } = useExerciseState(onResult)
  const isAnswered = uiState === 'answered'
  const correctSet = new Set(config.correctSpanIds)

  const toggle = (id: string) => {
    if (isAnswered) return
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }

  const handleCheck = () => {
    const evaluation = evaluateSpotTheHallucination(selected, config.correctSpanIds)
    submit({
      exerciseId: config.id,
      isCorrect: evaluation.isCorrect,
      score: evaluation.score,
      maxScore: evaluation.maxScore,
      userAnswer: { selectedSpanIds: selected },
    })
  }

  const getSegmentStyle = (id: string) => {
    const isSelected = selected.includes(id)
    const isHallucination = correctSet.has(id)

    if (!isAnswered) {
      return {
        bg: isSelected ? 'rgba(132, 204, 22, 0.25)' : 'transparent',
        borderColor: isSelected ? '#84CC16' : 'transparent',
        color: '#E4E4E7',
        cursor: 'pointer',
      }
    }

    if (isHallucination && isSelected) {
      return {
        bg: 'rgba(132, 204, 22, 0.35)',
        borderColor: '#84CC16',
        color: '#FFFFFF',
        cursor: 'default',
      }
    }
    if (isHallucination && !isSelected) {
      return {
        bg: 'rgba(248, 113, 113, 0.25)',
        borderColor: '#F87171',
        color: '#FFFFFF',
        cursor: 'default',
      }
    }
    if (!isHallucination && isSelected) {
      return {
        bg: 'rgba(248, 113, 113, 0.2)',
        borderColor: '#F87171',
        color: '#FECACA',
        cursor: 'default',
      }
    }
    return {
      bg: 'transparent',
      borderColor: 'transparent',
      color: '#A1A1AA',
      cursor: 'default',
    }
  }

  return (
    <ExerciseShell
      mode={mode}
      title={title}
      onNext={onNext}
      uiState={uiState}
      isCorrect={result?.isCorrect ?? null}
      score={result?.score}
      maxScore={result?.maxScore}
      explanation={isAnswered ? config.explanation : null}
      onCheck={handleCheck}
      canCheck={selected.length > 0}
      checkHint={
        selected.length > 0
          ? 'Можно выбрать несколько фрагментов — возможен частичный балл'
          : 'Кликните по фрагментам текста, которые выглядят недостоверно'
      }
      accentBorder="#CA8A04"
    >
      <Box>
        <Text fontSize="xs" color="#84CC16" fontWeight="600" mb={2}>
          НАЙТИ ГАЛЛЮЦИНАЦИЮ — выделите подозрительные фрагменты
        </Text>
        <Text fontSize="lg" fontWeight="600" color="#FFFFFF" mb={4}>
          {config.prompt}
        </Text>
      </Box>

      <Box
        p={5}
        borderRadius="md"
        borderWidth="2px"
        borderColor="#3F3F46"
        bg="#0c0c0c"
        role="group"
        aria-label={config.responseLabel ?? 'Ответ модели'}
      >
        <Text fontSize="xs" color="#71717A" mb={3} fontWeight="600">
          {config.responseLabel ?? 'Ответ AI'}
        </Text>
        <Text fontSize="md" lineHeight="2" color="#D4D4D8">
          {config.segments.map((segment, index) => {
            const styles = getSegmentStyle(segment.id)
            return (
              <button
                key={segment.id}
                type="button"
                data-testid={`spot-span-${segment.id}`}
                onClick={() => toggle(segment.id)}
                aria-pressed={selected.includes(segment.id)}
                aria-label={`Фрагмент ${index + 1}`}
                style={{
                  display: 'inline',
                  padding: '2px 4px',
                  margin: '0 2px',
                  borderRadius: '4px',
                  border: `2px solid ${styles.borderColor}`,
                  background: styles.bg,
                  color: styles.color,
                  fontWeight: selected.includes(segment.id) ? 600 : 400,
                  cursor: styles.cursor,
                  fontFamily: 'inherit',
                  fontSize: 'inherit',
                  lineHeight: 'inherit',
                  verticalAlign: 'baseline',
                }}
              >
                {segment.text}
              </button>
            )
          })}
        </Text>
      </Box>

      {isAnswered && (
        <HStackLegend />
      )}
    </ExerciseShell>
  )
}

function HStackLegend() {
  return (
    <Box mt={2} fontSize="xs" color="#A1A1AA">
      <Text as="span" color="#84CC16" mr={4}>
        ■ верно найдено
      </Text>
      <Text as="span" color="#F87171" mr={4}>
        ■ пропущено / ошибка
      </Text>
    </Box>
  )
}
