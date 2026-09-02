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
import type { BaseExerciseProps, PromptBuilderExerciseConfig } from '@/types/exercise'
import { evaluatePromptBuilder } from '@/utils/evaluate-prompt-builder'
import { useExerciseState } from '@/hooks/use-exercise-state'
import { ExerciseShell } from './exercise-shell'

function shuffleBlocks<T extends { id: string }>(items: T[]): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

const dragId = (blockId: string) => `block-${blockId}`
const dropId = (slotId: string) => `slot-${slotId}`
const parseDragId = (id: string) => id.replace('block-', '')
const parseDropId = (id: string) => id.replace('slot-', '')

function DraggableBlock({
  blockId,
  label,
  disabled,
  selected,
  onSelect,
}: {
  blockId: string
  label: string
  disabled: boolean
  selected: boolean
  onSelect: (id: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: dragId(blockId),
    disabled,
  })

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined

  return (
    <Box
      ref={setNodeRef}
      data-testid={`prompt-block-${blockId}`}
      style={style}
      px={4}
      py={3}
      borderRadius="md"
      borderWidth="2px"
      borderColor={selected ? '#BEF264' : '#65A30D'}
      bg={selected ? 'rgba(132, 204, 22, 0.2)' : isDragging ? '#27272A' : '#18181B'}
      color="#FFFFFF"
      fontWeight="600"
      fontSize="sm"
      cursor={disabled ? 'default' : 'grab'}
      opacity={isDragging ? 0.4 : 1}
      touchAction="none"
      onClick={() => !disabled && onSelect(blockId)}
      {...attributes}
      {...listeners}
    >
      {label}
    </Box>
  )
}

function BuilderSlot({
  slotId,
  title,
  hint,
  assignedPreview,
  isAnswered,
  isCorrect,
  canAssign,
  onAssign,
}: {
  slotId: string
  title: string
  hint: string
  assignedPreview: string | null
  isAnswered: boolean
  isCorrect: boolean | null
  canAssign: boolean
  onAssign: (slotId: string) => void
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: dropId(slotId),
    disabled: isAnswered,
  })

  let borderColor = '#3F3F46'
  let bg = '#27272A'
  if (isAnswered && isCorrect !== null) {
    borderColor = isCorrect ? '#84CC16' : '#F87171'
    bg = isCorrect ? 'rgba(132, 204, 22, 0.12)' : 'rgba(248, 113, 113, 0.1)'
  } else if (isOver) {
    borderColor = '#84CC16'
    bg = 'rgba(132, 204, 22, 0.08)'
  } else if (assignedPreview) {
    borderColor = '#65A30D'
  }

  return (
    <Box
      borderWidth="1px"
      borderColor="#3F3F46"
      borderRadius="md"
      overflow="hidden"
      bg="#18181B"
    >
      <HStack
        px={4}
        py={2}
        bg="#27272A"
        borderBottomWidth="1px"
        borderColor="#3F3F46"
        justify="space-between"
      >
        <Text fontSize="xs" fontWeight="700" color="#84CC16" textTransform="uppercase">
          {title}
        </Text>
        {isAnswered && isCorrect !== null && (
          <Text fontWeight="700" color={isCorrect ? '#84CC16' : '#F87171'}>
            {isCorrect ? '✓' : '✗'}
          </Text>
        )}
      </HStack>
      <Box
        ref={setNodeRef}
        data-testid={`prompt-slot-${slotId}`}
        px={4}
        py={3}
        minH="72px"
        borderWidth="2px"
        borderStyle={assignedPreview ? 'solid' : 'dashed'}
        borderColor={borderColor}
        bg={bg}
        m={3}
        borderRadius="md"
        cursor={canAssign ? 'pointer' : 'default'}
        onClick={() => canAssign && onAssign(slotId)}
      >
        {assignedPreview ? (
          <Text color="#FFFFFF" fontSize="sm" lineHeight="tall">
            {assignedPreview}
          </Text>
        ) : (
          <Text color="#71717A" fontSize="sm">
            {hint}
          </Text>
        )}
      </Box>
    </Box>
  )
}

export function PromptBuilderExercise({
  config,
  mode = 'inline',
  title,
  onResult,
  onNext,
}: BaseExerciseProps<PromptBuilderExerciseConfig>) {
  const shuffledBlocks = useMemo(
    () => shuffleBlocks(config.blocks),
    [config.id],
  )

  const [assignments, setAssignments] = useState<Record<string, string>>({})
  const [activeDragId, setActiveDragId] = useState<string | null>(null)
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null)
  const { uiState, result, submit } = useExerciseState(onResult)
  const isAnswered = uiState === 'answered'

  const blockById = useMemo(
    () => Object.fromEntries(config.blocks.map((b) => [b.id, b])),
    [config.blocks],
  )

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  )

  const assignedBlockIds = new Set(Object.values(assignments))
  const poolBlocks = shuffledBlocks.filter((b) => !assignedBlockIds.has(b.id))

  const assignBlock = (slotId: string, blockId: string) => {
    setAssignments((prev) => {
      const next = { ...prev }
      for (const key of Object.keys(next)) {
        if (next[key] === blockId) delete next[key]
      }
      next[slotId] = blockId
      return next
    })
    setSelectedBlockId(null)
  }

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragId(String(event.active.id))
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDragId(null)
    const { active, over } = event
    if (!over || isAnswered) return

    const blockId = parseDragId(String(active.id))
    const slotId = parseDropId(String(over.id))

    assignBlock(slotId, blockId)
  }

  const handleCheck = () => {
    const evaluation = evaluatePromptBuilder(assignments, config.slots)
    submit({
      exerciseId: config.id,
      isCorrect: evaluation.isCorrect,
      score: evaluation.score,
      maxScore: evaluation.maxScore,
      userAnswer: assignments,
    })
  }

  const allFilled = config.slots.every((s) => assignments[s.slotId] !== undefined)
  const activeBlock = activeDragId ? blockById[parseDragId(activeDragId)] : null

  const assembledPreview = config.slots
    .map((slot) => {
      const blockId = assignments[slot.slotId]
      return blockId ? blockById[blockId]?.preview : null
    })
    .filter(Boolean)
    .join('\n\n')

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
      canCheck={allFilled}
      checkHint={
        allFilled
          ? 'Проверьте собранный промпт'
          : 'Перетащите блок в каждый слот каркаса'
      }
      accentBorder="#4D7C0F"
    >
      <Box>
        <Text fontSize="xs" color="#84CC16" fontWeight="600" mb={2}>
          СОБРАТЬ ПРОМПТ — перетащите блоки в слоты
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
          {config.slots.map((slot) => {
            const blockId = assignments[slot.slotId]
            const rowCorrect =
              isAnswered && blockId !== undefined
                ? blockId === slot.correctBlockId
                : null

            return (
              <BuilderSlot
                key={slot.slotId}
                slotId={slot.slotId}
                title={slot.title}
                hint={slot.hint}
                assignedPreview={blockId ? blockById[blockId]?.preview ?? null : null}
                isAnswered={isAnswered}
                isCorrect={rowCorrect}
                canAssign={!isAnswered && selectedBlockId !== null}
                onAssign={(slotId) =>
                  selectedBlockId && assignBlock(slotId, selectedBlockId)
                }
              />
            )
          })}
        </VStack>

        {!isAnswered && poolBlocks.length > 0 && (
          <Box mt={6}>
            <Text fontSize="sm" color="#A1A1AA" mb={3}>
              Блоки для сборки:
            </Text>
            <HStack gap={3} flexWrap="wrap">
              {poolBlocks.map((block) => (
                <DraggableBlock
                  key={block.id}
                  blockId={block.id}
                  label={block.label}
                  disabled={false}
                  selected={selectedBlockId === block.id}
                  onSelect={(id) =>
                    setSelectedBlockId((prev) => (prev === id ? null : id))
                  }
                />
              ))}
            </HStack>
          </Box>
        )}

        {assembledPreview && (
          <Box
            mt={6}
            p={4}
            borderRadius="md"
            borderWidth="1px"
            borderColor="#3F3F46"
            bg="#0c0c0c"
          >
            <Text fontSize="xs" color="#84CC16" fontWeight="600" mb={2}>
              ПРЕВЬЮ ПРОМПТА
            </Text>
            <Text color="#D4D4D8" fontSize="sm" whiteSpace="pre-wrap" lineHeight="tall">
              {assembledPreview}
            </Text>
          </Box>
        )}

        <DragOverlay>
          {activeBlock ? (
            <Box
              px={4}
              py={3}
              borderRadius="md"
              borderWidth="2px"
              borderColor="#65A30D"
              bg="#27272A"
              color="#FFFFFF"
              fontWeight="600"
              boxShadow="0 8px 24px rgba(0,0,0,0.4)"
            >
              {activeBlock.label}
            </Box>
          ) : null}
        </DragOverlay>
      </DndContext>
    </ExerciseShell>
  )
}
