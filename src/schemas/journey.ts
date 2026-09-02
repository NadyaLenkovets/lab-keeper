import { z } from 'zod'

const explanationSchema = z.object({
  correct: z.string(),
  incorrect: z.string(),
})

const choiceOptionSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
})

const closedBase = {
  id: z.string().min(1),
  prompt: z.string().min(1),
  explanation: explanationSchema,
}

const singleChoiceSchema = z.object({
  ...closedBase,
  type: z.literal('singleChoice'),
  options: z.array(choiceOptionSchema).min(2),
  correctOptionIds: z.array(z.string()).min(1),
})

const multipleChoiceSchema = z.object({
  ...closedBase,
  type: z.literal('multipleChoice'),
  options: z.array(choiceOptionSchema).min(2),
  correctOptionIds: z.array(z.string()).min(1),
})

const trueFalseSchema = z.object({
  ...closedBase,
  type: z.literal('trueFalse'),
  correctAnswer: z.boolean(),
})

const fillTheBlankSchema = z.object({
  ...closedBase,
  type: z.literal('fillTheBlank'),
  blanks: z
    .array(
      z.object({
        id: z.string().min(1),
        correctAnswers: z.array(z.string()).min(1),
      }),
    )
    .min(1),
})

const matchPairsSchema = z.object({
  ...closedBase,
  type: z.literal('matchPairs'),
  pairs: z
    .array(
      z.object({
        leftId: z.string(),
        leftLabel: z.string(),
        rightId: z.string(),
        rightLabel: z.string(),
      }),
    )
    .min(2),
})

const orderStepsSchema = z.object({
  ...closedBase,
  type: z.literal('orderSteps'),
  steps: z.array(z.object({ id: z.string(), label: z.string() })).min(2),
  correctOrderIds: z.array(z.string()).min(2),
})

const freeTextSchema = z.object({
  id: z.string().min(1),
  type: z.enum([
    'freeResponse',
    'explainLikeImFive',
    'teachBack',
    'giveYourExample',
  ]),
  prompt: z.string().min(1),
  concept: z.string().min(1),
  rubric: z.array(z.string()).min(1),
  modelAnswer: z.string().min(1),
  keywords: z.array(z.string()).min(1),
  hint: z.string().optional(),
})

const buildTheBridgeSchema = z.object({
  id: z.string().min(1),
  type: z.literal('buildTheBridge'),
  prompt: z.string().min(1),
  conceptA: z.string().min(1),
  conceptB: z.string().min(1),
  rubric: z.array(z.string()).min(1),
  modelAnswer: z.string().min(1),
  keywords: z.array(z.string()).min(1),
  hint: z.string().optional(),
})

export const activitySchema = z.discriminatedUnion('type', [
  singleChoiceSchema,
  multipleChoiceSchema,
  trueFalseSchema,
  fillTheBlankSchema,
  matchPairsSchema,
  orderStepsSchema,
  freeTextSchema,
  buildTheBridgeSchema,
])

export const checkpointSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  concept: z.string().min(1),
  dependsOn: z.array(z.string()),
  difficulty: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  timeLimitSec: z.number().int().min(30).max(900),
  activities: z.array(activitySchema).min(1).max(5),
})

export const journeySchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  sourceSummary: z.string().min(1),
  checkpoints: z.array(checkpointSchema).min(1).max(8),
  createdAt: z.string().min(1),
  origin: z.enum(['human', 'ai', 'demo']).optional(),
})

export type JourneyParsed = z.infer<typeof journeySchema>

export function parseJourney(data: unknown): JourneyParsed {
  return journeySchema.parse(data)
}

export function safeParseJourney(data: unknown) {
  return journeySchema.safeParse(data)
}
