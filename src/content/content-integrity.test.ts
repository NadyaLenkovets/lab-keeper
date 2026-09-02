import { describe, expect, it } from 'vitest'
import { galjucinaciiArticle } from '@/content/articles/galjucinacii'
import { kakRabotayutLlmArticle } from '@/content/articles/kak-rabotayut-llm'
import { strukturaPromptaArticle } from '@/content/articles/struktura-prompta'
import { exercisesById } from '@/content/exercises/index'
import { testsIndex } from '@/content/tests-index'
import type { Article } from '@/types/article'

const articles: Article[] = [
  kakRabotayutLlmArticle,
  galjucinaciiArticle,
  strukturaPromptaArticle,
]

function collectArticleExerciseIds(article: Article): string[] {
  return article.blocks
    .filter((b): b is { type: 'exercise'; exerciseId: string } => b.type === 'exercise')
    .map((b) => b.exerciseId)
}

describe('content integrity', () => {
  it('every config key matches config.id', () => {
    for (const [key, config] of Object.entries(exercisesById)) {
      expect(config.id).toBe(key)
    }
  })

  it('no duplicate ids across topic files', () => {
    expect(Object.keys(exercisesById).length).toBe(
      new Set(Object.keys(exercisesById)).size,
    )
  })

  it('all article exercise ids exist and are not test ids', () => {
    const articleIds = articles.flatMap(collectArticleExerciseIds)
    expect(articleIds.length).toBe(6)

    for (const id of articleIds) {
      expect(exercisesById[id], `missing config for ${id}`).toBeDefined()
      expect(id).not.toMatch(/-test-/)
    }
  })

  it('all test exercise ids exist, use -test- prefix, and do not overlap articles', () => {
    const articleIds = new Set(articles.flatMap(collectArticleExerciseIds))
    const testIds = testsIndex.flatMap((t) => t.exerciseIds)

    for (const test of testsIndex) {
      expect(test.exerciseIds).toHaveLength(10)
    }

    for (const id of testIds) {
      expect(exercisesById[id], `missing config for ${id}`).toBeDefined()
      expect(id).toMatch(/-test-/)
      expect(articleIds.has(id), `${id} must not be used inline`).toBe(false)
    }

    expect(new Set(testIds).size).toBe(testIds.length)
  })
})
