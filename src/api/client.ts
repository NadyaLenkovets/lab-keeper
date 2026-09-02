export class ApiError extends Error {
  status: number
  code?: string

  constructor(message: string, status: number, code?: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

async function parseError(res: Response): Promise<ApiError> {
  try {
    const data = (await res.json()) as { error?: string; code?: string }
    return new ApiError(
      data.error ?? `HTTP ${res.status}`,
      res.status,
      data.code,
    )
  } catch {
    return new ApiError(`HTTP ${res.status}`, res.status)
  }
}

export type HealthResponse = {
  ok: boolean
  modelConfigured: boolean
  model: string
  ragChunks?: number
  ragModel?: string | null
  ragVectors?: number
  ragCreatedAt?: string
}

export async function fetchHealth(): Promise<HealthResponse> {
  const res = await fetch('/api/health')
  if (!res.ok) throw await parseError(res)
  return (await res.json()) as HealthResponse
}

export type GenerateJourneyRequest = {
  topic?: string
  text?: string
  size: 'short' | 'medium'
}

export async function generateJourney(body: GenerateJourneyRequest) {
  const res = await fetch('/api/generate-journey', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw await parseError(res)
  const data = (await res.json()) as { journey: import('@/types/journey').Journey }
  return data.journey
}

/** Один сетевой вызов на одинаковый draft — защита от React StrictMode (двойной useEffect). */
const generateInflight = new Map<string, Promise<import('@/types/journey').Journey>>()

export function generateJourneyOnce(body: GenerateJourneyRequest) {
  const key = JSON.stringify({
    topic: body.topic ?? '',
    text: body.text ?? '',
    size: body.size,
  })
  const existing = generateInflight.get(key)
  if (existing) return existing

  const promise = generateJourney(body).finally(() => {
    window.setTimeout(() => {
      generateInflight.delete(key)
    }, 30_000)
  })
  generateInflight.set(key, promise)
  return promise
}

export type GradeAnswerRequest = {
  activityType: string
  prompt: string
  concept?: string
  conceptA?: string
  conceptB?: string
  rubric: string[]
  modelAnswer: string
  userAnswer: string
}

export type GradeAnswerResponse = {
  score: number
  maxScore: number
  status: 'correct' | 'partial' | 'incorrect'
  feedback: string
  strengths?: string[]
  gaps?: string[]
}

export async function gradeAnswer(
  body: GradeAnswerRequest,
): Promise<GradeAnswerResponse> {
  const res = await fetch('/api/grade-answer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw await parseError(res)
  return (await res.json()) as GradeAnswerResponse
}

export type NextStepsRequest = {
  title: string
  sourceSummary: string
  percent: number
  blocks: Array<{
    title: string
    concept: string
    percent: number
    weakHints: string[]
  }>
}

export type NextStepsResponse = {
  summary: string
  recommendations: Array<{ title: string; why: string; action: string }>
  source: 'ai' | 'local'
}

export async function fetchNextSteps(
  body: NextStepsRequest,
): Promise<NextStepsResponse> {
  const res = await fetch('/api/next-steps', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw await parseError(res)
  return (await res.json()) as NextStepsResponse
}

export type AskAction = import('@/types/rag').AskAction
export type AskResponse = import('@/types/rag').AskResponse

export async function askPlatform(body: {
  action?: AskAction
  question: string
  passage?: string
  learnerSummary?: string
}): Promise<AskResponse> {
  const res = await fetch('/api/ask', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: body.action ?? 'ask',
      question: body.question,
      passage: body.passage,
      learnerSummary: body.learnerSummary,
    }),
  })
  if (!res.ok) throw await parseError(res)
  return (await res.json()) as AskResponse
}
