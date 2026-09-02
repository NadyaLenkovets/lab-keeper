import { Box, Text } from '@chakra-ui/react'
import type { ActivityConfig, ActivityResult } from '@/types/activity'
import {
  isBuildTheBridgeActivity,
  isFreeTextActivity,
} from '@/types/activity'
import { exerciseRegistry } from '@/components/exercises/exercise-registry'
import { FreeTextExercise } from '@/components/exercises/free-text-exercise'
import { BuildTheBridgeExercise } from '@/components/exercises/build-the-bridge-exercise'
import {
  asExerciseConfig,
  isJourneyClosedType,
  mapExerciseResultToActivity,
} from '@/utils/map-activity-result'
import { activityTypeLabel } from '@/utils/journey'

type ActivityStepProps = {
  activity: ActivityConfig
  onResult: (result: ActivityResult) => void
  onNext: () => void
  disabled?: boolean
  useRemoteGrade?: boolean
}

export function ActivityStep({
  activity,
  onResult,
  onNext,
  disabled = false,
  useRemoteGrade = false,
}: ActivityStepProps) {
  if (isFreeTextActivity(activity)) {
    return (
      <FreeTextExercise
        config={activity}
        mode="test"
        onResult={onResult}
        onNext={onNext}
        disabled={disabled}
        useRemoteGrade={useRemoteGrade}
      />
    )
  }

  if (isBuildTheBridgeActivity(activity)) {
    return (
      <BuildTheBridgeExercise
        config={activity}
        mode="test"
        onResult={onResult}
        onNext={onNext}
        disabled={disabled}
        useRemoteGrade={useRemoteGrade}
      />
    )
  }

  if (isJourneyClosedType(activity)) {
    const Component = exerciseRegistry[activity.type]
    return (
      <Box opacity={disabled ? 0.85 : 1} pointerEvents={disabled ? 'none' : 'auto'}>
        <Component
          config={asExerciseConfig(activity)}
          mode="test"
          title={activityTypeLabel(activity.type)}
          onResult={(exerciseResult) => {
            if (disabled) return
            onResult(mapExerciseResultToActivity(exerciseResult, activity))
          }}
          onNext={onNext}
        />
        {disabled && (
          <Text mt={2} fontSize="sm" color="#F87171">
            Время вышло — ответ заблокирован.
          </Text>
        )}
      </Box>
    )
  }

  return (
    <Text color="#F87171">
      Неизвестный тип активности: {(activity as ActivityConfig).type}
    </Text>
  )
}
