export type RagSourceType = 'article' | 'exercise' | 'test' | 'journey'

export type ContentOrigin = 'human' | 'ai' | 'demo'

export type TopicId =
  | 'kak-rabotayut-llm'
  | 'galjucinacii'
  | 'struktura-prompta'
  | 'general'

export type RagChunk = {
  id: string
  sourceType: RagSourceType
  origin: ContentOrigin
  topicId: TopicId
  title: string
  sectionId: string
  url: string
  text: string
  embedding?: number[]
}

export type RagHit = {
  chunk: RagChunk
  score: number
}

export type RagIndexFile = {
  version: 1
  model: string | null
  createdAt: string
  chunks: RagChunk[]
}

export type AskAction = 'ask' | 'explain' | 'analyze' | 'recommend' | 'relate'

export type AskSource = {
  id: string
  title: string
  sourceType: RagSourceType
  url: string
  snippet: string
  score: number
}

export type AskResponse = {
  answer: string
  sources: AskSource[]
  mode: 'grounded' | 'chunks-only' | 'empty'
  action: AskAction
}
