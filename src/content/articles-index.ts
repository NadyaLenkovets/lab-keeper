import type { ArticleSummary } from '@/types/article'
import { galjucinaciiArticle } from '@/content/articles/galjucinacii'
import { kakRabotayutLlmArticle } from '@/content/articles/kak-rabotayut-llm'
import { strukturaPromptaArticle } from '@/content/articles/struktura-prompta'

export const articlesIndex: ArticleSummary[] = [
  {
    slug: kakRabotayutLlmArticle.slug,
    title: kakRabotayutLlmArticle.title,
    description: kakRabotayutLlmArticle.description,
    readingTimeMin: kakRabotayutLlmArticle.readingTimeMin,
  },
  {
    slug: galjucinaciiArticle.slug,
    title: galjucinaciiArticle.title,
    description: galjucinaciiArticle.description,
    readingTimeMin: galjucinaciiArticle.readingTimeMin,
  },
  {
    slug: strukturaPromptaArticle.slug,
    title: strukturaPromptaArticle.title,
    description: strukturaPromptaArticle.description,
    readingTimeMin: strukturaPromptaArticle.readingTimeMin,
  },
]
