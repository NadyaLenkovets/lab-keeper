/** Single source for design hex values (Chakra tokens + inline UI). */
export const palette = {
  canvas: '#161616',
  fg: '#FFFFFF',
  fgMuted: '#A1A1AA',
  accent: '#84CC16',
  accentHover: '#BEF264',
  accentMuted: '#3F6212',
  partial: '#EAB308',
  error: '#F87171',
  surfaceCard: '#18181B',
  surfaceElevated: '#27272A',
  border: '#3F3F46',
  disabled: '#71717A',
  onAccent: '#18181B',
} as const

export type AnswerStatus = 'correct' | 'partial' | 'incorrect'

export const answerStatusStyles: Record<
  AnswerStatus,
  {
    color: string
    border: string
    bg: string
    cardBg: string
    label: string
    mark: string
  }
> = {
  correct: {
    color: palette.accent,
    border: palette.accent,
    bg: 'rgba(132, 204, 22, 0.15)',
    cardBg: 'rgba(63, 98, 18, 0.25)',
    label: 'Верно!',
    mark: '✓',
  },
  partial: {
    color: palette.partial,
    border: palette.partial,
    bg: 'rgba(234, 179, 8, 0.15)',
    cardBg: 'rgba(113, 63, 18, 0.25)',
    label: 'Частично верно',
    mark: '◐',
  },
  incorrect: {
    color: palette.error,
    border: palette.error,
    bg: 'rgba(248, 113, 113, 0.12)',
    cardBg: 'rgba(127, 29, 29, 0.2)',
    label: 'Неверно',
    mark: '✗',
  },
}

/** Compact styles for progress dots (test runner). */
export const answerStatusProgress = {
  correct: {
    bg: 'rgba(132, 204, 22, 0.25)',
    border: palette.accent,
    color: palette.accent,
  },
  partial: {
    bg: 'rgba(234, 179, 8, 0.2)',
    border: palette.partial,
    color: palette.partial,
  },
  incorrect: {
    bg: 'rgba(248, 113, 113, 0.15)',
    border: palette.error,
    color: palette.error,
  },
  pending: {
    bg: palette.surfaceElevated,
    border: palette.border,
    color: palette.disabled,
  },
  active: {
    bg: 'rgba(132, 204, 22, 0.15)',
    border: palette.accent,
    color: palette.accent,
  },
} as const
