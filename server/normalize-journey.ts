/** Приводит «кривой» JSON от free-моделей к форме, ближе к journeySchema. */

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

/** {} / одиночное значение / объект с числовыми ключами → массив */
export function asArray(v: unknown): unknown[] {
  if (v == null) return []
  if (Array.isArray(v)) return v
  if (isPlainObject(v)) {
    const keys = Object.keys(v)
    if (keys.length === 0) return []
    if (keys.every((k) => /^\d+$/.test(k))) {
      return keys
        .sort((a, b) => Number(a) - Number(b))
        .map((k) => v[k])
    }
    return [v]
  }
  return [v]
}

function asString(v: unknown, fallback = ''): string {
  if (typeof v === 'string') return v
  if (typeof v === 'number' || typeof v === 'boolean') return String(v)
  return fallback
}

function asStringList(v: unknown): string[] {
  return asArray(v)
    .map((item) => asString(item).trim())
    .filter(Boolean)
}

function asInt(v: unknown, fallback: number): number {
  const n = typeof v === 'number' ? v : Number(asString(v))
  return Number.isFinite(n) ? Math.round(n) : fallback
}

function normalizeOptions(v: unknown): { id: string; label: string }[] {
  if (Array.isArray(v)) {
    return v.map((item, i) => {
      if (isPlainObject(item)) {
        return {
          id: asString(item.id || item.value, `opt-${i + 1}`),
          label: asString(item.label ?? item.text ?? item.title, `Вариант ${i + 1}`),
        }
      }
      return { id: `opt-${i + 1}`, label: asString(item, `Вариант ${i + 1}`) }
    })
  }
  if (isPlainObject(v)) {
    return Object.entries(v).map(([id, label]) => ({
      id,
      label: asString(label, id),
    }))
  }
  return []
}

function normalizeExplanation(v: unknown): { correct: string; incorrect: string } {
  if (isPlainObject(v)) {
    return {
      correct: asString(v.correct || v.right || v.ok, 'Верно.'),
      incorrect: asString(v.incorrect || v.wrong || v.fail, 'Неверно. Попробуйте ещё раз.'),
    }
  }
  if (typeof v === 'string' && v.trim()) {
    return { correct: v.trim(), incorrect: 'Неверный ответ.' }
  }
  return {
    correct: 'Верно.',
    incorrect: 'Неверно. Посмотрите пояснение и попробуйте снова.',
  }
}

function normalizeClosedBase(raw: Record<string, unknown>, index: number) {
  return {
    id: asString(raw.id, `act-${index + 1}`),
    prompt: asString(raw.prompt || raw.question || raw.text, 'Вопрос'),
    explanation: normalizeExplanation(raw.explanation),
  }
}

function normalizeOpenFields(
  raw: Record<string, unknown>,
  checkpointConcept: string,
) {
  const rubric = asStringList(raw.rubric)
  const keywords = asStringList(raw.keywords ?? raw.keyword)
  return {
    concept: asString(raw.concept, checkpointConcept || 'Концепция'),
    rubric: rubric.length > 0 ? rubric : ['Смысл верный', 'Есть пример или пояснение'],
    modelAnswer: asString(
      raw.modelAnswer || raw.sampleAnswer || raw.answer,
      'Краткий эталонный ответ по концепции.',
    ),
    keywords:
      keywords.length > 0 ? keywords : ['понят', 'пример', 'связ', 'смысл'],
    hint: raw.hint != null ? asString(raw.hint) : undefined,
  }
}

const TYPE_ALIASES: Record<string, string> = {
  singlechoice: 'singleChoice',
  single_choice: 'singleChoice',
  multiplechoice: 'multipleChoice',
  multiple_choice: 'multipleChoice',
  multichoice: 'multipleChoice',
  mcq: 'multipleChoice',
  truefalse: 'trueFalse',
  true_false: 'trueFalse',
  boolean: 'trueFalse',
  filltheblank: 'fillTheBlank',
  fill_the_blank: 'fillTheBlank',
  fillblank: 'fillTheBlank',
  cloze: 'fillTheBlank',
  ordersteps: 'orderSteps',
  order_steps: 'orderSteps',
  ordering: 'orderSteps',
  matchpairs: 'matchPairs',
  match_pairs: 'matchPairs',
  matching: 'matchPairs',
  freeresponse: 'freeResponse',
  free_response: 'freeResponse',
  freetext: 'freeResponse',
  free_text: 'freeResponse',
  open: 'freeResponse',
  explainlikeimfive: 'explainLikeImFive',
  explain_like_im_five: 'explainLikeImFive',
  eli5: 'explainLikeImFive',
  teachback: 'teachBack',
  teach_back: 'teachBack',
  giveyourexample: 'giveYourExample',
  give_your_example: 'giveYourExample',
  example: 'giveYourExample',
  buildthebridge: 'buildTheBridge',
  build_the_bridge: 'buildTheBridge',
  bridge: 'buildTheBridge',
}

function resolveActivityType(raw: string): string {
  const trimmed = raw.trim()
  if (!trimmed) return ''
  if (
    [
      'singleChoice',
      'multipleChoice',
      'trueFalse',
      'fillTheBlank',
      'matchPairs',
      'orderSteps',
      'freeResponse',
      'explainLikeImFive',
      'teachBack',
      'giveYourExample',
      'buildTheBridge',
    ].includes(trimmed)
  ) {
    return trimmed
  }
  const key = trimmed.toLowerCase().replace(/[\s-]+/g, '_')
  return TYPE_ALIASES[key] ?? TYPE_ALIASES[trimmed.toLowerCase()] ?? 'freeResponse'
}

function normalizeActivity(
  raw: unknown,
  index: number,
  checkpointConcept: string,
): Record<string, unknown> | null {
  if (!isPlainObject(raw)) return null
  const type = resolveActivityType(asString(raw.type))
  if (!type) return null

  const base = normalizeClosedBase(raw, index)

  switch (type) {
    case 'singleChoice':
    case 'multipleChoice': {
      const options = normalizeOptions(raw.options)
      let correctOptionIds = asStringList(
        raw.correctOptionIds ?? raw.correctIds ?? raw.correctAnswer,
      )
      if (correctOptionIds.length === 0 && options[0]) {
        correctOptionIds = [options[0].id]
      }
      return {
        ...base,
        type,
        options:
          options.length >= 2
            ? options
            : [
                { id: 'a', label: 'Вариант A' },
                { id: 'b', label: 'Вариант B' },
              ],
        correctOptionIds,
      }
    }
    case 'trueFalse': {
      let correctAnswer = raw.correctAnswer
      if (typeof correctAnswer === 'string') {
        correctAnswer = ['true', 'верно', 'да', '1'].includes(
          correctAnswer.trim().toLowerCase(),
        )
      }
      if (typeof correctAnswer !== 'boolean') correctAnswer = false
      return { ...base, type, correctAnswer }
    }
    case 'fillTheBlank': {
      const blanks = asArray(raw.blanks).map((b, i) => {
        if (!isPlainObject(b)) {
          return {
            id: `blank-${i + 1}`,
            correctAnswers: [asString(b, 'ответ')],
          }
        }
        return {
          id: asString(b.id, `blank-${i + 1}`),
          correctAnswers: asStringList(
            b.correctAnswers ?? b.answers ?? b.answer,
          ).length
            ? asStringList(b.correctAnswers ?? b.answers ?? b.answer)
            : ['ответ'],
        }
      })
      return {
        ...base,
        type,
        blanks: blanks.length > 0 ? blanks : [{ id: 'blank-1', correctAnswers: ['ответ'] }],
      }
    }
    case 'orderSteps': {
      const steps = asArray(raw.steps).map((s, i) => {
        if (isPlainObject(s)) {
          return {
            id: asString(s.id, `s${i + 1}`),
            label: asString(s.label ?? s.text, `Шаг ${i + 1}`),
          }
        }
        return { id: `s${i + 1}`, label: asString(s, `Шаг ${i + 1}`) }
      })
      let correctOrderIds = asStringList(raw.correctOrderIds ?? raw.correctOrder)
      if (correctOrderIds.length === 0) {
        correctOrderIds = steps.map((s) => s.id)
      }
      return {
        ...base,
        type,
        steps:
          steps.length >= 2
            ? steps
            : [
                { id: 's1', label: 'Шаг 1' },
                { id: 's2', label: 'Шаг 2' },
              ],
        correctOrderIds,
      }
    }
    case 'matchPairs': {
      const pairs = asArray(raw.pairs).map((p, i) => {
        if (!isPlainObject(p)) {
          return {
            leftId: `l${i + 1}`,
            leftLabel: `Лево ${i + 1}`,
            rightId: `r${i + 1}`,
            rightLabel: `Право ${i + 1}`,
          }
        }
        return {
          leftId: asString(p.leftId, `l${i + 1}`),
          leftLabel: asString(p.leftLabel ?? p.left, `Лево ${i + 1}`),
          rightId: asString(p.rightId, `r${i + 1}`),
          rightLabel: asString(p.rightLabel ?? p.right, `Право ${i + 1}`),
        }
      })
      return {
        ...base,
        type,
        pairs:
          pairs.length >= 2
            ? pairs
            : [
                {
                  leftId: 'l1',
                  leftLabel: 'A',
                  rightId: 'r1',
                  rightLabel: '1',
                },
                {
                  leftId: 'l2',
                  leftLabel: 'B',
                  rightId: 'r2',
                  rightLabel: '2',
                },
              ],
      }
    }
    case 'freeResponse':
    case 'explainLikeImFive':
    case 'teachBack':
    case 'giveYourExample': {
      const open = normalizeOpenFields(raw, checkpointConcept)
      return {
        id: base.id,
        type,
        prompt: base.prompt,
        ...open,
      }
    }
    case 'buildTheBridge': {
      const open = normalizeOpenFields(raw, checkpointConcept)
      return {
        id: base.id,
        type,
        prompt: base.prompt,
        conceptA: asString(raw.conceptA, checkpointConcept || 'Концепция A'),
        conceptB: asString(raw.conceptB, 'Концепция B'),
        rubric: open.rubric,
        modelAnswer: open.modelAnswer,
        keywords: open.keywords,
        hint: open.hint,
      }
    }
    default:
      return null
  }
}

function normalizeCheckpoint(raw: unknown, index: number): Record<string, unknown> | null {
  if (!isPlainObject(raw)) return null
  const concept = asString(raw.concept || raw.title, `Концепция ${index + 1}`)
  const activities = asArray(raw.activities ?? raw.tasks ?? raw.questions)
    .map((a, i) => normalizeActivity(a, i, concept))
    .filter((a): a is Record<string, unknown> => a != null)

  let difficulty = asInt(raw.difficulty, 1)
  if (difficulty < 1) difficulty = 1
  if (difficulty > 3) difficulty = 3

  let timeLimitSec = asInt(raw.timeLimitSec ?? raw.timeLimit ?? raw.timer, 180)
  if (timeLimitSec < 30) timeLimitSec = 30
  if (timeLimitSec > 900) timeLimitSec = 900

  return {
    id: asString(raw.id, `cp-${index + 1}`),
    title: asString(raw.title, `Блок ${index + 1}`),
    concept,
    dependsOn: asStringList(raw.dependsOn),
    difficulty,
    timeLimitSec,
    activities:
      activities.length > 0
        ? activities
        : [
            {
              id: `cp-${index + 1}-tf`,
              type: 'trueFalse',
              prompt: `Верно ли утверждение о «${concept}»?`,
              correctAnswer: true,
              explanation: {
                correct: 'Верно.',
                incorrect: 'Неверно.',
              },
            },
          ],
  }
}

/** Разворачивает обёртки вроде { journey: {...} } / { data: {...} }. */
function unwrapJourneyRoot(raw: unknown): unknown {
  if (!isPlainObject(raw)) return raw
  if (Array.isArray(raw.checkpoints)) return raw
  for (const key of ['journey', 'data', 'result', 'payload'] as const) {
    const nested = raw[key]
    if (isPlainObject(nested) && (nested.checkpoints != null || nested.title != null)) {
      return nested
    }
  }
  return raw
}

export function normalizeJourneyPayload(raw: unknown): unknown {
  const root = unwrapJourneyRoot(raw)
  if (!isPlainObject(root)) return raw

  const checkpoints = asArray(root.checkpoints ?? root.blocks ?? root.stages)
    .map((cp, i) => normalizeCheckpoint(cp, i))
    .filter((cp): cp is Record<string, unknown> => cp != null)

  return {
    id: asString(root.id, `kj-${Date.now()}`),
    title: asString(root.title, 'Учебное путешествие'),
    sourceSummary: asString(
      root.sourceSummary ?? root.summary ?? root.description,
      'Краткое резюме темы.',
    ),
    createdAt: asString(root.createdAt, new Date().toISOString()),
    checkpoints,
  }
}
