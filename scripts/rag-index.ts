import { writeFileSync, mkdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildAllChunks } from '../src/content/build-chunks.ts'
import { getAllArticles } from '../src/utils/get-article-by-slug.ts'
import { exercisesById } from '../src/content/exercises/index.ts'
import { demoJourney } from '../src/content/demo/demo-journey.ts'
import { embedTexts, getEmbeddingModel } from '../server/rag/embed.ts'
import type { RagIndexFile } from '../src/types/rag.ts'

const here = path.dirname(fileURLToPath(import.meta.url))
const outPath = path.resolve(here, '../data/rag-index.json')
const envPath = path.resolve(here, '../.env')

try {
  const envText = readFileSync(envPath, 'utf8')
  for (const line of envText.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq < 1) continue
    const key = trimmed.slice(0, eq).trim()
    const value = trimmed.slice(eq + 1).trim()
    if (!process.env[key]) process.env[key] = value
  }
} catch {
  // без .env индекс будет лексическим
}

async function main() {
  const drafts = buildAllChunks({
    articles: getAllArticles(),
    exercises: Object.values(exercisesById),
    journeys: [
      { journey: demoJourney, origin: 'demo', topicId: 'galjucinacii' },
    ],
  })

  let embeddings: number[][] | null = null
  let model: string | null = null
  try {
    embeddings = await embedTexts(drafts.map((c) => `${c.title}\n${c.text}`))
    if (embeddings) model = getEmbeddingModel()
  } catch (err) {
    console.warn('Embeddings недоступны, индекс будет лексическим:', err)
  }

  const chunks = drafts.map((chunk, i) => ({
    ...chunk,
    embedding: embeddings?.[i],
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
}

void main()
