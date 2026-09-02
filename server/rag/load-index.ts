import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { RagChunk, RagIndexFile } from '../../src/types/rag.ts'

const here = path.dirname(fileURLToPath(import.meta.url))
export const INDEX_PATH = path.resolve(here, '../../data/rag-index.json')

let cached: RagIndexFile | null = null

export function loadRagIndex(force = false): RagIndexFile {
  if (cached && !force) return cached
  try {
    const raw = readFileSync(INDEX_PATH, 'utf8')
    cached = JSON.parse(raw) as RagIndexFile
    return cached
  } catch {
    cached = {
      version: 1,
      model: null,
      createdAt: new Date().toISOString(),
      chunks: [] as RagChunk[],
    }
    return cached
  }
}

export function getIndexChunks(): RagChunk[] {
  return loadRagIndex().chunks
}
