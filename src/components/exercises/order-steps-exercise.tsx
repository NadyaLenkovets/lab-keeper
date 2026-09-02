import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Box, HStack, Text, VStack } from '@chakra-ui/react'
import { useMemo, useState } from 'react'
import type { BaseExerciseProps, OrderStepsExerciseConfig } from '@/types/exercise'
import { evaluateOrderSteps } from '@/utils/evaluate-order-steps'
import { useExerciseState } from '@/hooks/use-exercise-state'
import { ExerciseShell } from './exercise-shell'

function shuffleIds(ids: string[]): string[] {
  const copy = [...ids]
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

type SortableStepRowProps = {
  id: string
  label: string
  index: number
  disabled: boolean
  positionCorrect: boolean | null
  canMoveUp: boolean
  canMoveDown: boolean
  onMoveUp: () => void
  onMoveDown: () => void
}

function SortableStepRow({
  id,
  label,
  index,
  disabled,
  positionCorrect,
  canMoveUp,
  canMoveDown,
  onMoveUp,
  onMoveDown,
}: SortableStepRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id, disabled })

  let borderColor = '#3F3F46'
  if (positionCorrect === true) borderColor = '#84CC16'
  if (positionCorrect === false) borderColor = '#F87171'
  if (isDragging) borderColor = '#84CC16'

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.85 : 1,
  }

  return (
    <HStack
      ref={setNodeRef}
      data-testid={`order-step-row-${id}`}
      style={style}
      gap={3}
      p={4}
      borderRadius="md"
      borderWidth="2px"
      borderColor={borderColor}
      bg={positionCorrect === false ? 'rgba(248, 113, 113, 0.08)' : '#27272A'}
      align="center"
    >
      <HStack gap={1} flexShrink={0}>
        <button
          type="button"
          data-testid={`order-step-up-${id}`}
          aria-label={`Поднять шаг ${index + 1}`}
          disabled={disabled || !canMoveUp}
          onClick={onMoveUp}
          style={{
            padding: '4px 8px',
            borderRadius: '4px',
            color: '#84CC16',
            fontSize: '14px',
            lineHeight: 1,
            cursor: disabled || !canMoveUp ? 'default' : 'pointer',
            background: 'transparent',
            border: '1px solid #3F3F46',
            fontFamily: 'inherit',
            opacity: disabled || !canMoveUp ? 0.35 : 1,
          }}
        >
          ↑
        </button>
        <button
          type="button"
          data-testid={`order-step-handle-${id}`}
          aria-label={`Перетащить шаг ${index + 1}`}
          style={{
            padding: '8px',
            borderRadius: '4px',
            color: '#84CC16',
            fontSize: '18px',
            lineHeight: 1,
            cursor: disabled ? 'default' : 'grab',
            touchAction: 'none',
            background: 'transparent',
            border: 'none',
            fontFamily: 'inherit',
          }}
          {...attributes}
          {...listeners}
        >
          ⋮⋮
        </button>
        <button
          type="button"
          data-testid={`order-step-down-${id}`}
          aria-label={`Опустить шаг ${index + 1}`}
          disabled={disabled || !canMoveDown}
          onClick={onMoveDown}
          style={{
            padding: '4px 8px',
            borderRadius: '4px',
            color: '#84CC16',
            fontSize: '14px',
            lineHeight: 1,
            cursor: disabled || !canMoveDown ? 'default' : 'pointer',
            background: 'transparent',
            border: '1px solid #3F3F46',
            fontFamily: 'inherit',
            opacity: disabled || !canMoveDown ? 0.35 : 1,
          }}
        >
          ↓
        </button>
      </HStack>
      <Text
        w="28px"
        textAlign="center"
        fontWeight="700"
        color="#84CC16"
        flexShrink={0}
      >
        {index + 1}
      </Text>
      {positionCorrect !== null && (
        <Text fontWeight="700" color={borderColor} flexShrink={0}>
          {positionCorrect ? '✓' : '✗'}
        </Text>
      )}
      <Text flex={1} color="#FFFFFF" fontWeight="500">
        {label}
      </Text>
    </HStack>
  )
}

export function OrderStepsExercise({
  config,
  mode = 'inline',
  title,
  onResult,
  onNext,
}: BaseExerciseProps<OrderStepsExerciseConfig>) {
  const initialOrder = useMemo(
    () => shuffleIds(config.steps.map((s) => s.id)),
    [config.id],
  )

  const [orderIds, setOrderIds] = useState<string[]>(initialOrder)
  const { uiState, result, submit } = useExerciseState(onResult)
  const isAnswered = uiState === 'answered'

  const labelById = useMemo(
    () => Object.fromEntries(config.steps.map((s) => [s.id, s.label])),
    [config.steps],
  )

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id || isAnswered) return

    setOrderIds((items) => {
      const oldIndex = items.indexOf(String(active.id))
      const newIndex = items.indexOf(String(over.id))
      return arrayMove(items, oldIndex, newIndex)
    })
  }

  const moveStep = (id: string, direction: -1 | 1) => {
    if (isAnswered) return
    setOrderIds((items) => {
      const index = items.indexOf(id)
      const target = index + direction
      if (index < 0 || target < 0 || target >= items.length) return items
      return arrayMove(items, index, target)
    })
  }

  const handleCheck = () => {
    const evaluation = evaluateOrderSteps(orderIds, config.correctOrderIds)
    submit({
      exerciseId: config.id,
      isCorrect: evaluation.isCorrect,
      score: evaluation.score,
      maxScore: evaluation.maxScore,
      userAnswer: orderIds,
    })
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
      canCheck
      checkHint="Перетащите шаги в правильном порядке, затем проверьте"
      accentBorder="#4D7C0F"
    >
      <Box>
        <Text fontSize="xs" color="#84CC16" fontWeight="600" mb={2}>
          РАССТАВИТЬ ШАГИ — перетащите за ⋮⋮
        </Text>
        <Text fontSize="lg" fontWeight="600" color="#FFFFFF">
          {config.prompt}
        </Text>
      </Box>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={orderIds} strategy={verticalListSortingStrategy}>
          <VStack align="stretch" gap={3}>
            {orderIds.map((id, index) => {
              const positionCorrect = isAnswered
                ? id === config.correctOrderIds[index]
                : null

              return (
                <SortableStepRow
                  key={id}
                  id={id}
                  label={labelById[id] ?? id}
                  index={index}
                  disabled={isAnswered}
                  positionCorrect={positionCorrect}
                  canMoveUp={index > 0}
                  canMoveDown={index < orderIds.length - 1}
                  onMoveUp={() => moveStep(id, -1)}
                  onMoveDown={() => moveStep(id, 1)}
                />
              )
            })}
          </VStack>
        </SortableContext>
      </DndContext>
    </ExerciseShell>
  )
}
