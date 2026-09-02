import { readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { RagChunk, RagIndexFile } from '../../src/types/rag.ts'
import { combineIndexChunks } from '../../src/utils/merge-journey-overlay.ts'
import { loadAiOverlay } from './overlay.ts'

const here = path.dirname(fileURLToPath(import.meta.url))
const INDEX_PATH = path.resolve(here, '../../data/rag-index.json')

let cached: RagIndexFile | null = null
let cachedMtime = 0

export function loadRagIndex(force = false): RagIndexFile {
  let mtime = 0
  try {
    mtime = statSync(INDEX_PATH).mtimeMs
  } catch {
    mtime = 0
  }
  if (cached && !force && mtime === cachedMtime) return cached
  try {
    const raw = readFileSync(INDEX_PATH, 'utf8')
    cached = JSON.parse(raw) as RagIndexFile
    cachedMtime = mtime
    return cached
  } catch {
    cached = {
      version: 1,
      model: null,
      createdAt: new Date().toISOString(),
      chunks: [] as RagChunk[],
    }
    cachedMtime = mtime
    return cached
  }
}

export function getIndexChunks(): RagChunk[] {
  return combineIndexChunks(loadRagIndex().chunks, loadAiOverlay().chunks)
}

export function indexStats() {
  const index = loadRagIndex()
  const chunks = getIndexChunks()
  const withVectors = chunks.filter((c) => (c.embedding?.length ?? 0) > 0).length
  return {
    ragChunks: chunks.length,
    ragModel: index.model,
    ragVectors: withVectors,
    ragCreatedAt: index.createdAt,
  }
}
