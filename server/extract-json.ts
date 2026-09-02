/** Достаёт JSON-объект из ответа модели (иногда в ```json ... ```). */
export function extractJsonObject(raw: string): unknown {
  const trimmed = raw.trim()
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i)
  const candidate = fenced?.[1]?.trim() ?? trimmed
  const start = candidate.indexOf('{')
  const end = candidate.lastIndexOf('}')
  if (start === -1 || end === -1 || end <= start) {
    throw new Error('В ответе модели нет JSON-объекта')
  }
  return JSON.parse(candidate.slice(start, end + 1)) as unknown
}
