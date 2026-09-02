import type { SVGProps } from 'react'

type CoverArtProps = SVGProps<SVGSVGElement>

export function KakRabotayutLlmCoverArt(props: CoverArtProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 800 360"
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-hidden
      {...props}
    >
      <defs>
        <linearGradient id="llm-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1a2e05" />
          <stop offset="45%" stopColor="#161616" />
          <stop offset="100%" stopColor="#0f0f0f" />
        </linearGradient>
        <linearGradient id="llm-glow" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#84CC16" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#84CC16" stopOpacity="0" />
        </linearGradient>
        <filter id="llm-blur" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="12" />
        </filter>
      </defs>
      <rect width="800" height="360" fill="url(#llm-bg)" />
      <ellipse cx="400" cy="120" rx="200" ry="80" fill="url(#llm-glow)" filter="url(#llm-blur)" />
      <g fill="none" stroke="#3F3F46" strokeWidth="2">
        <rect x="120" y="80" width="140" height="200" rx="12" />
        <rect x="330" y="60" width="140" height="220" rx="12" />
        <rect x="540" y="90" width="140" height="190" rx="12" />
      </g>
      <g stroke="#84CC16" strokeWidth="2" opacity="0.9">
        <path d="M260 140 L330 120" />
        <path d="M470 150 L540 130" />
        <circle cx="190" cy="140" r="6" fill="#84CC16" />
        <circle cx="400" cy="120" r="6" fill="#84CC16" />
        <circle cx="610" cy="150" r="6" fill="#84CC16" />
      </g>
      <g fill="#84CC16" opacity="0.85">
        <rect x="150" y="200" width="24" height="8" rx="2" />
        <rect x="180" y="200" width="40" height="8" rx="2" />
        <rect x="230" y="200" width="16" height="8" rx="2" />
        <rect x="360" y="180" width="32" height="8" rx="2" />
        <rect x="400" y="180" width="24" height="8" rx="2" />
        <rect x="430" y="180" width="48" height="8" rx="2" />
        <rect x="570" y="210" width="28" height="8" rx="2" />
        <rect x="605" y="210" width="36" height="8" rx="2" />
      </g>
      <text
        x="400"
        y="310"
        textAnchor="middle"
        fill="#BEF264"
        fontFamily="system-ui,sans-serif"
        fontSize="22"
        fontWeight="600"
      >
        Токены · контекст · предсказание
      </text>
    </svg>
  )
}

export function GaljucinaciiCoverArt(props: CoverArtProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 800 360"
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-hidden
      {...props}
    >
      <defs>
        <linearGradient id="hall-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2a1a05" />
          <stop offset="50%" stopColor="#161616" />
          <stop offset="100%" stopColor="#1a0a0a" />
        </linearGradient>
      </defs>
      <rect width="800" height="360" fill="url(#hall-bg)" />
      <rect
        x="200"
        y="70"
        width="400"
        height="220"
        rx="16"
        fill="#18181B"
        stroke="#3F3F46"
        strokeWidth="2"
      />
      <line x1="240" y1="120" x2="520" y2="120" stroke="#52525B" strokeWidth="3" strokeLinecap="round" />
      <line x1="240" y1="155" x2="480" y2="155" stroke="#52525B" strokeWidth="3" strokeLinecap="round" />
      <line
        x1="240"
        y1="190"
        x2="500"
        y2="190"
        stroke="#F87171"
        strokeWidth="4"
        strokeLinecap="round"
        opacity="0.95"
      />
      <line x1="240" y1="225" x2="460" y2="225" stroke="#52525B" strokeWidth="3" strokeLinecap="round" />
      <circle cx="520" cy="190" r="28" fill="none" stroke="#84CC16" strokeWidth="3" />
      <path
        d="M505 190 L515 200 L540 175"
        fill="none"
        stroke="#84CC16"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M620 100 L680 80 L650 160 Z"
        fill="#84CC16"
        opacity="0.2"
        stroke="#84CC16"
        strokeWidth="2"
      />
      <text x="655" y="130" fill="#EAB308" fontFamily="system-ui,sans-serif" fontSize="28" fontWeight="700">
        !
      </text>
      <text
        x="400"
        y="310"
        textAnchor="middle"
        fill="#BEF264"
        fontFamily="system-ui,sans-serif"
        fontSize="22"
        fontWeight="600"
      >
        Проверяйте факты · ищите выдумку
      </text>
    </svg>
  )
}

export function StrukturaPromptaCoverArt(props: CoverArtProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 800 360"
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-hidden
      {...props}
    >
      <defs>
        <linearGradient id="prompt-bg" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#161616" />
          <stop offset="50%" stopColor="#1a2e05" />
          <stop offset="100%" stopColor="#161616" />
        </linearGradient>
      </defs>
      <rect width="800" height="360" fill="url(#prompt-bg)" />
      <g transform="translate(220 55)">
        <rect x="0" y="0" width="360" height="52" rx="10" fill="#27272A" stroke="#84CC16" strokeWidth="2" />
        <text x="20" y="33" fill="#84CC16" fontFamily="system-ui,sans-serif" fontSize="16" fontWeight="700">
          Роль
        </text>
        <rect x="0" y="62" width="360" height="52" rx="10" fill="#27272A" stroke="#65A30D" strokeWidth="2" />
        <text x="20" y="95" fill="#BEF264" fontFamily="system-ui,sans-serif" fontSize="16" fontWeight="600">
          Контекст
        </text>
        <rect x="0" y="124" width="360" height="52" rx="10" fill="#27272A" stroke="#84CC16" strokeWidth="2" />
        <text x="20" y="157" fill="#84CC16" fontFamily="system-ui,sans-serif" fontSize="16" fontWeight="700">
          Задача
        </text>
        <rect x="0" y="186" width="360" height="52" rx="10" fill="#27272A" stroke="#4D7C0F" strokeWidth="2" />
        <text x="20" y="219" fill="#A3E635" fontFamily="system-ui,sans-serif" fontSize="16" fontWeight="600">
          Формат · ограничения
        </text>
      </g>
      <path
        d="M180 180 L210 180"
        stroke="#84CC16"
        strokeWidth="2"
        strokeDasharray="6 4"
        opacity="0.6"
      />
      <path
        d="M600 180 L630 180"
        stroke="#84CC16"
        strokeWidth="2"
        strokeDasharray="6 4"
        opacity="0.6"
      />
      <circle cx="150" cy="100" r="40" fill="none" stroke="#84CC16" strokeWidth="2" opacity="0.4" />
      <circle cx="650" cy="260" r="50" fill="none" stroke="#84CC16" strokeWidth="2" opacity="0.35" />
      <text
        x="400"
        y="310"
        textAnchor="middle"
        fill="#BEF264"
        fontFamily="system-ui,sans-serif"
        fontSize="22"
        fontWeight="600"
      >
        Каркас сильного промпта
      </text>
    </svg>
  )
}
