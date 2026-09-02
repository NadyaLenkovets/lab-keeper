import { createSystem, defaultConfig } from '@chakra-ui/react'
import { palette } from '@/theme/palette'

export const system = createSystem(defaultConfig, {
  theme: {
    tokens: {
      colors: {
        canvas: { value: palette.canvas },
        'fg.default': { value: palette.fg },
        'fg.muted': { value: palette.fgMuted },
        accent: { value: palette.accent },
        'accent.hover': { value: palette.accentHover },
        'accent.muted': { value: palette.accentMuted },
        'status.partial': { value: palette.partial },
        'surface.card': { value: palette.surfaceCard },
        'surface.elevated': { value: palette.surfaceElevated },
        'border.default': { value: palette.border },
        'on.accent': { value: palette.onAccent },
        'status.error': { value: palette.error },
      },
      fonts: {
        body: { value: 'Inter, system-ui, sans-serif' },
        heading: { value: 'Inter, system-ui, sans-serif' },
      },
      radii: {
        card: { value: '1rem' },
        pill: { value: '9999px' },
      },
    },
    semanticTokens: {
      colors: {
        bg: {
          DEFAULT: { value: '{colors.canvas}' },
          canvas: { value: '{colors.canvas}' },
          card: { value: '{colors.surface.card}' },
          elevated: { value: '{colors.surface.elevated}' },
        },
        fg: {
          DEFAULT: { value: '{colors.fg.default}' },
          muted: { value: '{colors.fg.muted}' },
        },
        accent: {
          DEFAULT: { value: '{colors.accent}' },
          hover: { value: '{colors.accent.hover}' },
          muted: { value: '{colors.accent.muted}' },
        },
        border: {
          DEFAULT: { value: '{colors.border.default}' },
        },
      },
    },
    recipes: {
      link: {
        base: {
          focusRing: 'none',
          _focus: {
            outline: 'none',
            boxShadow: 'none',
          },
          _focusVisible: {
            outline: 'none',
            boxShadow: 'none',
          },
        },
      },
    },
  },
  globalCss: {
    body: {
      bg: 'bg.canvas',
      color: 'fg',
      fontFamily: 'body',
      minWidth: '1280px',
    },
    '#root': {
      minHeight: '100vh',
    },
    'a, a:focus, a:active, a:focus-visible': {
      outline: 'none',
      boxShadow: 'none',
      WebkitTapHighlightColor: 'transparent',
    },
    '.chakra-link': {
      '&:is(:focus, :focus-visible, [data-focus])': {
        outline: 'none',
        boxShadow: 'none',
      },
    },
    'header a': {
      '&:is(:focus, :focus-visible, [data-focus])': {
        outline: 'none',
        boxShadow: 'none',
      },
    },
  },
})
