import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { Box, HStack, Text, VStack } from '@chakra-ui/react'
import { useMemo, useState } from 'react'
import type { BaseExerciseProps, MatchPairsExerciseConfig } from '@/types/exercise'
import { evaluateMatchPairs } from '@/utils/evaluate-match-pairs'
import { useExerciseState } from '@/hooks/use-exercise-state'
import { ExerciseShell } from './exercise-shell'

function shuffleIds<T extends { id: string }>(items: T[]): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

const dragId = (rightId: string) => `drag-${rightId}`
const dropId = (leftId: string) => `drop-${leftId}`
const parseDragId = (id: string) => id.replace('drag-', '')
const parseDropId = (id: string) => id.replace('drop-', '')

type DraggableChipProps = {
  rightId: string
  label: string
  disabled: boolean
}

function DraggableChip({
  rightId,
  label,
  disabled,
  selected,
  onSelect,
}: DraggableChipProps & { selected: boolean; onSelect: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: dragId(rightId),
    disabled,
  })

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined

  return (
    <Box
      ref={setNodeRef}
      data-testid={`match-pair-drag-${rightId}`}
      style={style}
      px={4}
      py={3}
      borderRadius="md"
      borderWidth="2px"
      borderColor={selected ? '#BEF264' : '#84CC16'}
      bg={selected ? 'rgba(132, 204, 22, 0.2)' : isDragging ? '#27272A' : '#18181B'}
      color="#FFFFFF"
      fontWeight="600"
      cursor={disabled ? 'default' : 'grab'}
      opacity={isDragging ? 0.4 : 1}
      touchAction="none"
      onClick={() => !disabled && onSelect(rightId)}
      {...attributes}
      {...listeners}
    >
      {label}
    </Box>
  )
}

type DropSlotProps = {
  leftId: string
  leftLabel: string
  assignedLabel: string | null
  isAnswered: boolean
  isCorrect: boolean | null
  canAssign: boolean
  onAssign: (leftId: string) => void
}

function DropSlot({
  leftId,
  leftLabel,
  assignedLabel,
  isAnswered,
  isCorrect,
  canAssign,
  onAssign,
}: DropSlotProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: dropId(leftId),
    disabled: isAnswered,
  })

  let borderColor = '#3F3F46'
  let bg = '#27272A'
  if (isAnswered && isCorrect !== null) {
    borderColor = isCorrect ? '#84CC16' : '#F87171'
    bg = isCorrect ? 'rgba(132, 204, 22, 0.15)' : 'rgba(248, 113, 113, 0.12)'
  } else if (isOver) {
    borderColor = '#84CC16'
    bg = 'rgba(132, 204, 22, 0.1)'
  } else if (assignedLabel) {
    borderColor = '#84CC16'
  }

  return (
    <HStack
      align="stretch"
      gap={4}
      p={3}
      borderRadius="md"
      borderWidth="1px"
      borderColor="#3F3F46"
      bg="#18181B"
    >
      <Box flex={1} minW="40%">
        <Text fontWeight="600" color="#FFFFFF">
          {leftLabel}
        </Text>
      </Box>
      <Box
        ref={setNodeRef}
        data-testid={`match-pair-drop-${leftId}`}
        flex={1}
        minH="48px"
        display="flex"
        alignItems="center"
        justifyContent="center"
        px={3}
        py={2}
        borderRadius="md"
        borderWidth="2px"
        borderStyle={assignedLabel ? 'solid' : 'dashed'}
        borderColor={borderColor}
        bg={bg}
        cursor={canAssign ? 'pointer' : 'default'}
        onClick={() => canAssign && onAssign(leftId)}
      >
        {isAnswered && isCorrect !== null && (
          <Text mr={2} fontWeight="700" color={borderColor}>
            {isCorrect ? '✓' : '✗'}
          </Text>
        )}
        <Text color={assignedLabel ? '#FFFFFF' : '#71717A'} fontWeight={assignedLabel ? 600 : 400}>
          {assignedLabel ?? 'Перетащите сюда'}
        </Text>
      </Box>
    </HStack>
  )
}

export function MatchPairsExercise({
  config,
  mode = 'inline',
  title,
  onResult,
  onNext,
}: BaseExerciseProps<MatchPairsExerciseConfig>) {
  const shuffledRights = useMemo(
    () =>
      shuffleIds(
        config.pairs.map((p) => ({ id: p.rightId, label: p.rightLabel })),
      ),
    [config.id],
  )

  const [matches, setMatches] = useState<Record<string, string>>({})
  const [activeDragId, setActiveDragId] = useState<string | null>(null)
  const [selectedRightId, setSelectedRightId] = useState<string | null>(null)
  const { uiState, result, submit } = useExerciseState(onResult)
  const isAnswered = uiState === 'answered'

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  )

  const rightById = useMemo(
    () => Object.fromEntries(config.pairs.map((p) => [p.rightId, p.rightLabel])),
    [config.pairs],
  )

  const assignedRightIds = new Set(Object.values(matches))
  const unassignedRights = shuffledRights.filter((r) => !assignedRightIds.has(r.id))

  const assignPair = (leftId: string, rightId: string) => {
    setMatches((prev) => {
      const next = { ...prev }
      for (const key of Object.keys(next)) {
        if (next[key] === rightId) delete next[key]
      }
      next[leftId] = rightId
      return next
    })
    setSelectedRightId(null)
  }

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragId(String(event.active.id))
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDragId(null)
    const { active, over } = event
    if (!over || isAnswered) return

    const rightId = parseDragId(String(active.id))
    const leftId = parseDropId(String(over.id))

    assignPair(leftId, rightId)
  }

  const handleCheck = () => {
    const evaluation = evaluateMatchPairs(matches, config.pairs)
    submit({
      exerciseId: config.id,
      isCorrect: evaluation.isCorrect,
      score: evaluation.score,
      maxScore: evaluation.maxScore,
      userAnswer: matches,
    })
  }

  const allMatched = config.pairs.every((p) => matches[p.leftId] !== undefined)
  const activeLabel = activeDragId ? rightById[parseDragId(activeDragId)] : null

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
      canCheck={allMatched}
      checkHint={
        allMatched
          ? 'Нажмите «Проверить ответ»'
          : 'Сопоставьте все пары перетаскиванием'
      }
      accentBorder="#A3E635"
    >
      <Box>
        <Text fontSize="xs" color="#84CC16" fontWeight="600" mb={2}>
          СОПОСТАВИТЬ ПАРЫ — перетащите термин к определению
        </Text>
        <Text fontSize="lg" fontWeight="600" color="#FFFFFF">
          {config.prompt}
        </Text>
      </Box>

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <VStack align="stretch" gap={3}>
          {config.pairs.map((pair) => {
            const assignedRightId = matches[pair.leftId]
            const rowCorrect =
              isAnswered && assignedRightId !== undefined
                ? assignedRightId === pair.rightId
                : null

            return (
              <DropSlot
                key={pair.leftId}
                leftId={pair.leftId}
                leftLabel={pair.leftLabel}
                assignedLabel={
                  assignedRightId ? rightById[assignedRightId] ?? null : null
                }
                isAnswered={isAnswered}
                isCorrect={rowCorrect}
                canAssign={!isAnswered && selectedRightId !== null}
                onAssign={(leftId) =>
                  selectedRightId && assignPair(leftId, selectedRightId)
                }
              />
            )
          })}
        </VStack>

        {!isAnswered && unassignedRights.length > 0 && (
          <Box mt={6}>
            <Text fontSize="sm" color="#A1A1AA" mb={3}>
              Варианты для сопоставления:
            </Text>
            <HStack gap={3} flexWrap="wrap">
              {unassignedRights.map((item) => (
                <DraggableChip
                  key={item.id}
                  rightId={item.id}
                  label={item.label}
                  disabled={false}
                  selected={selectedRightId === item.id}
                  onSelect={(id) =>
                    setSelectedRightId((prev) => (prev === id ? null : id))
                  }
                />
              ))}
            </HStack>
          </Box>
        )}

        <DragOverlay>
          {activeLabel ? (
            <Box
              px={4}
              py={3}
              borderRadius="md"
              borderWidth="2px"
              borderColor="#84CC16"
              bg="#27272A"
              color="#FFFFFF"
              fontWeight="600"
              boxShadow="0 8px 24px rgba(0,0,0,0.4)"
            >
              {activeLabel}
            </Box>
          ) : null}
        </DragOverlay>
      </DndContext>
    </ExerciseShell>
  )
}
