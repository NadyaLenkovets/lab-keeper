export const GENERATE_DRAFT_KEY = 'kj:generate-draft'

export type GenerateDraft = {
  topic: string
  text: string
  size: 'short' | 'medium'
}

export function saveGenerateDraft(draft: GenerateDraft): void {
  sessionStorage.setItem(GENERATE_DRAFT_KEY, JSON.stringify(draft))
}

export function loadGenerateDraft(): GenerateDraft | null {
  const raw = sessionStorage.getItem(GENERATE_DRAFT_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as GenerateDraft
  } catch {
    return null
  }
}

export function clearGenerateDraft(): void {
  sessionStorage.removeItem(GENERATE_DRAFT_KEY)
}
