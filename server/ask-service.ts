import type { AskAction, AskResponse, AskSource, RagChunk } from '../src/types/rag.ts'
import { chatCompletion, getOpenRouterConfig } from './openrouter.ts'
import {
  ANALYZE_SYSTEM,
  ASK_SYSTEM,
  EXPLAIN_SYSTEM,
  RECOMMEND_SYSTEM,
  RELATE_SYSTEM,
  buildAskUserMessage,
} from './prompts.ts'
import { embedTexts } from './rag/embed.ts'
import { getIndexChunks } from './rag/load-index.ts'
import { rankChunks } from './rag/search.ts'

const SYSTEM_BY_ACTION: Record<AskAction, string> = {
  ask: ASK_SYSTEM,
  explain: EXPLAIN_SYSTEM,
  analyze: ANALYZE_SYSTEM,
  recommend: RECOMMEND_SYSTEM,
  relate: RELATE_SYSTEM,
}

function toSources(hits: Array<{ chunk: RagChunk; score: number }>): AskSource[] {
  return hits.map((h) => ({
    id: h.chunk.id,
    title: h.chunk.title,
    sourceType: h.chunk.sourceType,
    url: h.chunk.url,
    snippet: h.chunk.text.slice(0, 220),
    score: Number(h.score.toFixed(3)),
  }))
}

function chunksOnlyAnswer(hits: Array<{ chunk: RagChunk; score: number }>): string {
  if (hits.length === 0) {
    return 'В материалах платформы пока нет подходящих фрагментов. Откройте статьи на главной или уточните вопрос.'
  }
  const lines = hits.map(
    (h, i) => `${i + 1}. ${h.chunk.title}\n${h.chunk.text.slice(0, 320)}`,
  )
  return `Ключ OpenRouter не задан, поэтому ниже — найденные фрагменты материалов без генерации ответа:\n\n${lines.join('\n\n')}`
}

export async function retrieveHits(query: string, topK = 5) {
  const chunks = getIndexChunks()
  let queryEmbedding: number[] | null = null
  const hasVectors = chunks.some((c) => c.embedding && c.embedding.length > 0)
  if (hasVectors) {
    try {
      const embedded = await embedTexts([query])
      queryEmbedding = embedded?.[0] ?? null
    } catch (err) {
      console.warn('[rag] embed query failed, lexical only:', err)
    }
  }
  return rankChunks(query, queryEmbedding, chunks, topK)
}

export async function runAskAction(input: {
  action: AskAction
  question: string
  passage?: string
  learnerSummary?: string
}): Promise<AskResponse> {
  const searchQuery = [input.question, input.passage].filter(Boolean).join('\n')
  const hits = await retrieveHits(searchQuery, input.action === 'analyze' ? 4 : 5)
  const sources = toSources(hits)

  if (hits.length === 0 && input.action === 'ask') {
    return {
      action: input.action,
      mode: 'empty',
      sources: [],
      answer:
        'В материалах Lab Keeper этого нет. Попробуйте вопрос про токены, галлюцинации или структуру промпта.',
    }
  }

  const { configured } = getOpenRouterConfig()
  if (!configured) {
    return {
      action: input.action,
      mode: hits.length ? 'chunks-only' : 'empty',
      sources,
      answer: chunksOnlyAnswer(hits),
    }
  }

  const system = SYSTEM_BY_ACTION[input.action]
  const user = buildAskUserMessage({
    action: input.action,
    question: input.question,
    passage: input.passage,
    learnerSummary: input.learnerSummary,
    chunks: hits.map((h) => ({
      title: h.chunk.title,
      sourceType: h.chunk.sourceType,
      url: h.chunk.url,
      text: h.chunk.text,
    })),
  })

  try {
    const { content } = await chatCompletion(
      [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      { temperature: 0.3, timeoutMs: 90_000 },
    )
    return {
      action: input.action,
      mode: 'grounded',
      sources,
      answer: content.trim(),
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Ошибка генерации'
    return {
      action: input.action,
      mode: hits.length ? 'chunks-only' : 'empty',
      sources,
      answer: `${message}\n\n${chunksOnlyAnswer(hits)}`,
    }
  }
}
