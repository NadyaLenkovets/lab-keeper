import { describe, expect, it } from 'vitest'
import { kakRabotayutLlmArticle } from '@/content/articles/kak-rabotayut-llm'
import { chunkArticle, chunkExercise, buildAllChunks } from '@/content/build-chunks'
import { getAllArticles } from '@/utils/get-article-by-slug'
import { exercisesById } from '@/content/exercises'
import { demoJourney } from '@/content/demo/demo-journey'

describe('chunkArticle', () => {
  it('режет статью на секции, не смешивая упражнения', () => {
    const chunks = chunkArticle(kakRabotayutLlmArticle)
    expect(chunks.length).toBeGreaterThan(1)
    expect(chunks.every((c) => c.sourceType === 'article')).toBe(true)
    expect(chunks.every((c) => c.url === '/article/kak-rabotayut-llm')).toBe(true)
    expect(chunks.some((c) => c.text.includes('токен'))).toBe(true)
  })
})

describe('chunkExercise', () => {
  it('кладёт вопрос и пояснение в текст чанка', () => {
    const first = Object.values(exercisesById)[0]
    const chunk = chunkExercise(first, 'test')
    expect(chunk.text).toContain(first.prompt)
    expect(chunk.sourceType).toBe('test')
  })
})

describe('buildAllChunks', () => {
  it('собирает статьи, упражнения и demo-journey', () => {
    const chunks = buildAllChunks({
      articles: getAllArticles(),
      exercises: Object.values(exercisesById),
      journeys: [
        { journey: demoJourney, origin: 'demo', topicId: 'galjucinacii' },
      ],
    })
    const types = new Set(chunks.map((c) => c.sourceType))
    expect(types.has('article')).toBe(true)
    expect(types.has('test') || types.has('exercise')).toBe(true)
    expect(types.has('journey')).toBe(true)
    expect(chunks.length).toBeGreaterThan(20)
  })
})
