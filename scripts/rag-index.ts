import { loadRootEnv } from '../server/load-env.ts'
import { writeFileSync, mkdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildAllChunks } from '../src/content/build-chunks.ts'
import { getAllArticles } from '../src/utils/get-article-by-slug.ts'
import { exercisesById } from '../src/content/exercises/index.ts'
import { demoJourney } from '../src/content/demo/demo-journey.ts'
import { embedTexts, getEmbeddingModel } from '../server/rag/embed.ts'
import type { RagIndexFile } from '../src/types/rag.ts'

loadRootEnv()

const here = path.dirname(fileURLToPath(import.meta.url))
const outPath = path.resolve(here, '../data/rag-index.json')

async function main() {
  const drafts = buildAllChunks({
    articles: getAllArticles(),
    exercises: Object.values(exercisesById),
    journeys: [
      { journey: demoJourney, origin: 'demo', topicId: 'galjucinacii' },
    ],
  })

  let embeddings: number[][] | null = null
  try {
    embeddings = await embedTexts(drafts.map((c) => `${c.title}\n${c.text}`))
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    throw new Error(`Не удалось построить векторный индекс: ${message}`)
  }
  if (!embeddings || embeddings.length !== drafts.length) {
    throw new Error(
      'Нет эмбеддингов. Проверьте OPENROUTER_API_KEY и OPENROUTER_EMBEDDING_MODEL.',
    )
  }
  const model = getEmbeddingModel()

  const chunks = drafts.map((chunk, i) => ({
    ...chunk,
    embedding: embeddings[i],
  }))

  const index: RagIndexFile = {
    version: 1,
    model,
    createdAt: new Date().toISOString(),
    chunks,
  }

  mkdirSync(path.dirname(outPath), { recursive: true })
  writeFileSync(outPath, JSON.stringify(index), 'utf8')
  const withVec = chunks.filter((c) => c.embedding?.length).length
  console.log(
    `Записано ${chunks.length} чанков (${withVec} с векторами) → ${outPath}`,
  )
  console.log(
    'AI-journey после генерации живут в data/ai-overlay.json и не затираются этой командой.',
  )
}

void main().catch((err: unknown) => {
  console.error(err)
  process.exit(1)
})
