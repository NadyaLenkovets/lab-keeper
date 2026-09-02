import type { ComponentType, SVGProps } from 'react'
import {
  GaljucinaciiCoverArt,
  KakRabotayutLlmCoverArt,
  StrukturaPromptaCoverArt,
} from '@/components/article-cover-art'

type CoverArtComponent = ComponentType<SVGProps<SVGSVGElement>>

export type ArticleCover = {
  Art: CoverArtComponent
  alt: string
}

export const articleCoverBySlug: Record<string, ArticleCover> = {
  'kak-rabotayut-llm': {
    Art: KakRabotayutLlmCoverArt,
    alt: 'Иллюстрация: слои модели и поток токенов',
  },
  galjucinacii: {
    Art: GaljucinaciiCoverArt,
    alt: 'Иллюстрация: проверка текста и подозрительный факт',
  },
  'struktura-prompta': {
    Art: StrukturaPromptaCoverArt,
    alt: 'Иллюстрация: блоки структуры промпта',
  },
}

export function getArticleCover(slug: string): ArticleCover | undefined {
  return articleCoverBySlug[slug]
}
