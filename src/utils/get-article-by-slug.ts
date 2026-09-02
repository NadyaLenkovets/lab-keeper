import type { Article } from '@/types/article'
import { galjucinaciiArticle } from '@/content/articles/galjucinacii'
import { kakRabotayutLlmArticle } from '@/content/articles/kak-rabotayut-llm'
import { strukturaPromptaArticle } from '@/content/articles/struktura-prompta'

const articles: Article[] = [
  kakRabotayutLlmArticle,
  galjucinaciiArticle,
  strukturaPromptaArticle,
]

export function getArticleBySlug(slug: string): Article | undefined {
  return articles.find((article) => article.slug === slug)
}

export function getAllArticles(): Article[] {
  return articles
}
