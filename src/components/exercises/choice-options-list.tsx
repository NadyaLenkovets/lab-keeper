import { Box, Circle, HStack, Square, Text, VStack } from '@chakra-ui/react'
import type { ChoiceOption } from '@/types/exercise'
import { getChoiceOptionStyles } from './choice-option-styles'

type ChoiceOptionsListProps = {
  options: ChoiceOption[]
  selectedIds: string[]
  correctOptionIds: string[]
  isAnswered: boolean
  selectionMode: 'single' | 'multiple'
  prompt: string
  onToggle: (id: string) => void
}

export function ChoiceOptionsList({
  options,
  selectedIds,
  correctOptionIds,
  isAnswered,
  selectionMode,
  prompt,
  onToggle,
}: ChoiceOptionsListProps) {
  const isSingle = selectionMode === 'single'

  return (
    <VStack
      align="stretch"
      gap={3}
      role={isSingle ? 'radiogroup' : 'group'}
      aria-label={prompt}
    >
      {options.map((option) => {
        const isSelected = selectedIds.includes(option.id)
        const isCorrectOption = correctOptionIds.includes(option.id)
        const styles = getChoiceOptionStyles(isAnswered, isSelected, isCorrectOption)
        const showMark =
          isAnswered && (isCorrectOption || (isSelected && !isCorrectOption))

        return (
          <Box
            key={option.id}
            as="button"
            role={isSingle ? 'radio' : 'checkbox'}
            aria-checked={isSelected}
            textAlign="left"
            w="full"
            p={4}
            borderRadius="md"
            borderWidth="2px"
            borderColor={styles.borderColor}
            bg={styles.bg}
            color={styles.color}
            cursor={isAnswered ? 'default' : 'pointer'}
            onClick={() => onToggle(option.id)}
            _hover={
              isAnswered ? {} : { bg: '#27272A', borderColor: '#84CC16' }
            }
          >
            <HStack gap={3} align="flex-start">
              {!isAnswered && isSingle && (
                <Circle
                  size="20px"
                  borderWidth="2px"
                  borderColor={isSelected ? '#84CC16' : '#71717A'}
                  bg={isSelected ? '#84CC16' : 'transparent'}
                  flexShrink={0}
                  mt={1}
                >
                  {isSelected && <Circle size="8px" bg="#18181B" />}
                </Circle>
              )}
              {!isAnswered && !isSingle && (
                <Square
                  size="20px"
                  borderWidth="2px"
                  borderColor={isSelected ? '#84CC16' : '#71717A'}
                  bg={isSelected ? '#84CC16' : 'transparent'}
                  borderRadius="sm"
                  flexShrink={0}
                  mt={1}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  {isSelected && (
                    <Text fontSize="xs" fontWeight="700" color="#18181B">
                      ✓
                    </Text>
                  )}
                </Square>
              )}
              {showMark && (
                <Text
                  fontWeight="700"
                  color={isCorrectOption ? '#84CC16' : '#F87171'}
                  flexShrink={0}
                >
                  {isCorrectOption ? '✓' : '✗'}
                </Text>
              )}
              <Text flex={1}>{option.label}</Text>
            </HStack>
          </Box>
        )
      })}
    </VStack>
  )
}
