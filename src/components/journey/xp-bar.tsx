import { Box, HStack, Text, VStack, Wrap, WrapItem } from '@chakra-ui/react'
import type { GamificationState } from '@/types/gamification'
import { ACHIEVEMENTS } from '@/types/gamification'
import { streakMultiplier } from '@/utils/gamification'
import { palette } from '@/theme/palette'

type XpBarProps = {
  state: GamificationState
}

export function XpBar({ state }: XpBarProps) {
  const mult = streakMultiplier(Math.max(state.streak, 1))
  const showMult = state.streak >= 2

  return (
    <VStack align="stretch" gap={3}>
      <HStack
        justify="space-between"
        p={4}
        borderRadius="lg"
        borderWidth="1px"
        borderColor="border"
        bg="bg.card"
        flexWrap="wrap"
        gap={3}
      >
        <Box>
          <Text fontSize="xs" color="fg.muted" mb={1}>
            Опыт
          </Text>
          <Text fontSize="xl" fontWeight="700" color="accent">
            {state.xp} XP
          </Text>
        </Box>
        <Box textAlign="right">
          <Text fontSize="xs" color="fg.muted" mb={1}>
            Серия
          </Text>
          <Text fontSize="xl" fontWeight="700" color="fg">
            ×{state.streak}
            {showMult && (
              <Text as="span" fontSize="sm" color="accent" ml={2}>
                ×{mult.toFixed(2)}
              </Text>
            )}
          </Text>
        </Box>
        <Box textAlign="right">
          <Text fontSize="xs" color="fg.muted" mb={1}>
            Лучшая серия
          </Text>
          <Text fontSize="lg" fontWeight="600" color="fg.muted">
            {state.bestStreak}
          </Text>
        </Box>
      </HStack>

      {state.justUnlocked.length > 0 && (
        <Box
          p={3}
          borderRadius="md"
          borderWidth="1px"
          borderColor={palette.accent}
          bg="rgba(132, 204, 22, 0.12)"
        >
          {state.justUnlocked.map((id) => (
            <Text key={id} color={palette.accent} fontWeight="600" fontSize="sm">
              Достижение: {ACHIEVEMENTS[id].title}
            </Text>
          ))}
        </Box>
      )}

      {state.unlockedAchievements.length > 0 && (
        <Wrap gap={2}>
          {state.unlockedAchievements.map((id) => (
            <WrapItem key={id}>
              <Box
                px={3}
                py={1}
                borderRadius="md"
                borderWidth="1px"
                borderColor="border"
                bg="bg.card"
                fontSize="xs"
                color="fg.muted"
                title={ACHIEVEMENTS[id].description}
              >
                {ACHIEVEMENTS[id].title}
              </Box>
            </WrapItem>
          ))}
        </Wrap>
      )}
    </VStack>
  )
}
