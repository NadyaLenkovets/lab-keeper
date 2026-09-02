import type { ActivityResult } from '@/types/activity'
import type { Journey, JourneyProgress } from '@/types/journey'
import { safeParseJourney } from '@/schemas/journey'

const JOURNEY_PREFIX = 'kj:journey:'
const PROGRESS_PREFIX = 'kj:progress:'
const ACTIVE_KEY = 'kj:active-journey-id'

export function saveJourney(journey: Journey): void {
  localStorage.setItem(JOURNEY_PREFIX + journey.id, JSON.stringify(journey))
  localStorage.setItem(ACTIVE_KEY, journey.id)
}

export function loadJourney(id: string): Journey | null {
  const raw = localStorage.getItem(JOURNEY_PREFIX + id)
  if (!raw) return null
  try {
    const parsed = safeParseJourney(JSON.parse(raw) as unknown)
    return parsed.success ? (parsed.data as Journey) : null
  } catch {
    return null
  }
}

export function saveProgress(progress: JourneyProgress): void {
  localStorage.setItem(
    PROGRESS_PREFIX + progress.journeyId,
    JSON.stringify(progress),
  )
}

export function loadProgress(journeyId: string): JourneyProgress | null {
  const raw = localStorage.getItem(PROGRESS_PREFIX + journeyId)
  if (!raw) return null
  try {
    return JSON.parse(raw) as JourneyProgress
  } catch {
    return null
  }
}

export function createEmptyProgress(journeyId: string): JourneyProgress {
  return {
    journeyId,
    results: [] as ActivityResult[],
    currentFlatIndex: 0,
    completed: false,
    updatedAt: new Date().toISOString(),
  }
}
