import { mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { AiRagOverlayFile } from '../../src/types/rag.ts'
import { emptyAiOverlay } from '../../src/utils/merge-journey-overlay.ts'

const here = path.dirname(fileURLToPath(import.meta.url))
const OVERLAY_PATH = path.resolve(here, '../../data/ai-overlay.json')

let cached: AiRagOverlayFile | null = null
let cachedMtime = 0

export function loadAiOverlay(force = false): AiRagOverlayFile {
  let mtime = 0
  try {
    mtime = statSync(OVERLAY_PATH).mtimeMs
  } catch {
    cached = emptyAiOverlay()
    cachedMtime = 0
    return cached
  }
  if (cached && !force && mtime === cachedMtime) return cached
  try {
    const raw = readFileSync(OVERLAY_PATH, 'utf8')
    cached = JSON.parse(raw) as AiRagOverlayFile
    cachedMtime = mtime
    return cached
  } catch {
    cached = emptyAiOverlay()
    cachedMtime = mtime
    return cached
  }
}

export function writeAiOverlay(overlay: AiRagOverlayFile): void {
  mkdirSync(path.dirname(OVERLAY_PATH), { recursive: true })
  writeFileSync(OVERLAY_PATH, JSON.stringify(overlay), 'utf8')
  cached = overlay
  try {
    cachedMtime = statSync(OVERLAY_PATH).mtimeMs
  } catch {
    cachedMtime = Date.now()
  }
}
