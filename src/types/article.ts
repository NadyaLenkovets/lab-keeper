export type ArticleBlock =
  | { type: 'heading'; level: 1 | 2 | 3; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'list'; items: string[]; ordered?: boolean }
  | { type: 'callout'; variant: 'tip' | 'warning' | 'example'; text: string }
  | { type: 'exercise'; exerciseId: string }

export type Article = {
  slug: string
  title: string
  description: string
  readingTimeMin: number
  blocks: ArticleBlock[]
}

export type ArticleSummary = {
  slug: string
  title: string
  description: string
  readingTimeMin: number
}
