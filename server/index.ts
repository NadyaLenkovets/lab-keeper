import { loadRootEnv } from './load-env.ts'
import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { z } from 'zod'
import { generateJourneyFromAi, gradeAnswerFromAi, nextStepsFromAi } from './ai-service.ts'
import { getOpenRouterConfig } from './openrouter.ts'
import { runAskAction, retrieveHits } from './ask-service.ts'
import { loadRagIndex } from './rag/load-index.ts'

loadRootEnv()

const app = new Hono()

app.use(
  '/api/*',
  cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  }),
)

app.get('/api/health', (c) => {
  const { configured, model } = getOpenRouterConfig()
  const index = loadRagIndex()
  return c.json({
    ok: true,
    modelConfigured: configured,
    model,
    ragChunks: index.chunks.length,
    ragModel: index.model,
  })
})

const generateBodySchema = z
  .object({
    topic: z.string().optional(),
    text: z.string().optional(),
    size: z.enum(['short', 'medium']).default('short'),
  })
  .refine((v) => Boolean(v.topic?.trim() || v.text?.trim()), {
    message: 'Нужна тема или текст',
  })

app.post('/api/generate-journey', async (c) => {
  const { configured } = getOpenRouterConfig()
  if (!configured) {
    return c.json(
      {
        error: 'Ключ OpenRouter не задан. Создайте .env и вставьте OPENROUTER_API_KEY.',
        code: 'NO_API_KEY',
      },
      401,
    )
  }

  let body: z.infer<typeof generateBodySchema>
  try {
    body = generateBodySchema.parse(await c.req.json())
  } catch {
    return c.json({ error: 'Некорректное тело запроса', code: 'BAD_REQUEST' }, 400)
  }

  const topic = body.topic?.trim()
  const text = body.text?.trim()
  if ((topic?.length ?? 0) < 3 && (text?.length ?? 0) < 40) {
    return c.json(
      {
        error: 'Слишком короткий ввод: тема ≥ 3 символов или текст ≥ 40 символов.',
        code: 'INPUT_TOO_SHORT',
      },
      400,
    )
  }

  try {
    const journey = await generateJourneyFromAi({
      topic,
      text,
      size: body.size,
    })
    return c.json({ journey })
  } catch (err) {
    const status =
      err && typeof err === 'object' && 'status' in err
        ? Number((err as { status: number }).status)
        : 502
    const message = err instanceof Error ? err.message : 'Ошибка генерации'
    console.error('[generate-journey] failed:', message)
    return c.json(
      {
        error: message,
        code: status === 429 ? 'RATE_LIMIT' : 'GENERATE_FAILED',
      },
      status >= 400 && status < 600 ? status : 502,
    )
  }
})

const gradeBodySchema = z.object({
  activityType: z.string().min(1),
  prompt: z.string().min(1),
  concept: z.string().optional(),
  conceptA: z.string().optional(),
  conceptB: z.string().optional(),
  rubric: z.array(z.string()).min(1),
  modelAnswer: z.string().min(1),
  userAnswer: z.string().min(1),
})

app.post('/api/grade-answer', async (c) => {
  const { configured } = getOpenRouterConfig()
  if (!configured) {
    return c.json(
      { error: 'Ключ OpenRouter не задан на сервере', code: 'NO_API_KEY' },
      401,
    )
  }

  let body: z.infer<typeof gradeBodySchema>
  try {
    body = gradeBodySchema.parse(await c.req.json())
  } catch {
    return c.json({ error: 'Некорректное тело запроса', code: 'BAD_REQUEST' }, 400)
  }

  try {
    const result = await gradeAnswerFromAi(body)
    return c.json(result)
  } catch (err) {
    const status =
      err && typeof err === 'object' && 'status' in err
        ? Number((err as { status: number }).status)
        : 502
    const message = err instanceof Error ? err.message : 'Ошибка оценки'
    return c.json(
      {
        error: message,
        code: status === 429 ? 'RATE_LIMIT' : 'GRADE_FAILED',
      },
      status >= 400 && status < 600 ? status : 502,
    )
  }
})

const nextStepsBodySchema = z.object({
  title: z.string().min(1),
  sourceSummary: z.string().min(1),
  percent: z.number().min(0).max(100),
  blocks: z
    .array(
      z.object({
        title: z.string().min(1),
        concept: z.string().min(1),
        percent: z.number().min(0).max(100),
        weakHints: z.array(z.string()).default([]),
      }),
    )
    .min(1),
})

app.post('/api/next-steps', async (c) => {
  const { configured } = getOpenRouterConfig()
  if (!configured) {
    return c.json(
      { error: 'Ключ OpenRouter не задан на сервере', code: 'NO_API_KEY' },
      401,
    )
  }

  let body: z.infer<typeof nextStepsBodySchema>
  try {
    body = nextStepsBodySchema.parse(await c.req.json())
  } catch {
    return c.json({ error: 'Некорректное тело запроса', code: 'BAD_REQUEST' }, 400)
  }

  try {
    const result = await nextStepsFromAi(body)
    return c.json({ ...result, source: 'ai' as const })
  } catch (err) {
    const status =
      err && typeof err === 'object' && 'status' in err
        ? Number((err as { status: number }).status)
        : 502
    const message = err instanceof Error ? err.message : 'Ошибка рекомендаций'
    console.error('[next-steps] failed:', message)
    return c.json(
      {
        error: message,
        code: status === 429 ? 'RATE_LIMIT' : 'NEXT_STEPS_FAILED',
      },
      status >= 400 && status < 600 ? status : 502,
    )
  }
})

const askBodySchema = z.object({
  action: z
    .enum(['ask', 'explain', 'analyze', 'recommend', 'relate'])
    .default('ask'),
  question: z.string().min(3),
  passage: z.string().optional(),
  learnerSummary: z.string().optional(),
})

app.post('/api/rag/search', async (c) => {
  let body: { query: string; topK?: number }
  try {
    body = z
      .object({ query: z.string().min(2), topK: z.number().int().min(1).max(10).optional() })
      .parse(await c.req.json())
  } catch {
    return c.json({ error: 'Некорректное тело запроса', code: 'BAD_REQUEST' }, 400)
  }
  const hits = await retrieveHits(body.query, body.topK ?? 5)
  return c.json({
    hits: hits.map((h) => ({
      id: h.chunk.id,
      title: h.chunk.title,
      sourceType: h.chunk.sourceType,
      url: h.chunk.url,
      snippet: h.chunk.text.slice(0, 280),
      score: Number(h.score.toFixed(3)),
      origin: h.chunk.origin,
    })),
  })
})

app.post('/api/ask', async (c) => {
  let body: z.infer<typeof askBodySchema>
  try {
    body = askBodySchema.parse(await c.req.json())
  } catch {
    return c.json({ error: 'Некорректное тело запроса', code: 'BAD_REQUEST' }, 400)
  }
  try {
    const result = await runAskAction({
      action: body.action,
      question: body.question,
      passage: body.passage,
      learnerSummary: body.learnerSummary,
    })
    return c.json(result)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Ошибка ask'
    console.error('[ask] failed:', message)
    return c.json({ error: message, code: 'ASK_FAILED' }, 502)
  }
})

const port = Number(process.env.PORT) || 3001

serve({ fetch: app.fetch, port }, () => {
  const { configured, model } = getOpenRouterConfig()
  console.log(`[lab-keeper] API http://localhost:${port}`)
  console.log(
    `[lab-keeper] model=${model} key=${configured ? 'set' : 'MISSING'}`,
  )
})
