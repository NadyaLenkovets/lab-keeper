import { useEffect, useEffectEvent, useRef, useState } from 'react'

type UseCheckpointTimerArgs = {
  timeLimitSec: number
  paused?: boolean
  enabled?: boolean
  onExpire: () => void
}

/**
 * Таймер одного чекпоинта. При смене чекпоинта remountите хук через key.
 */
export function useCheckpointTimer({
  timeLimitSec,
  paused = false,
  enabled = true,
  onExpire,
}: UseCheckpointTimerArgs) {
  const [remainingSec, setRemainingSec] = useState(timeLimitSec)
  const expiredRef = useRef(false)
  const onExpireEvent = useEffectEvent(onExpire)

  useEffect(() => {
    if (!enabled || paused || expiredRef.current) return

    const id = window.setInterval(() => {
      setRemainingSec((prev) => {
        if (prev <= 1) {
          if (!expiredRef.current) {
            expiredRef.current = true
            queueMicrotask(() => {
              onExpireEvent()
            })
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => window.clearInterval(id)
  }, [paused, enabled])

  const ratio = timeLimitSec > 0 ? remainingSec / timeLimitSec : 0
  const urgent = ratio > 0 && ratio <= 0.2

  return { remainingSec, ratio, urgent, totalSec: timeLimitSec }
}

export function formatTimer(sec: number): string {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}
