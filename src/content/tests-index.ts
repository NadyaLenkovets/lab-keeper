export type TopicTest = {
  slug: string
  title: string
  description: string
  exerciseIds: string[]
}

/** 10 шагов: все 9 типов + один доп. вопрос (второй экземпляр базового типа) */
export const testsIndex: TopicTest[] = [
  {
    slug: 'kak-rabotayut-llm',
    title: 'Как работают LLM',
    description:
      'Закрепите тему статьи: как модель читает текст, что такое контекст и почему «память» ограничена.',
    exerciseIds: [
      'llm-test-sc',
      'llm-test-tf',
      'llm-test-mc',
      'llm-test-fill',
      'llm-test-match',
      'llm-test-order',
      'llm-test-builder',
      'llm-test-spot',
      'llm-test-failure',
      'llm-test-tf2',
    ],
  },
  {
    slug: 'galjucinacii',
    title: 'Галлюцинации',
    description:
      'Проверьте, насколько уверенно вы отличаете факты от выдумки и снижаете риск ошибок.',
    exerciseIds: [
      'hall-test-sc',
      'hall-test-tf',
      'hall-test-mc',
      'hall-test-fill',
      'hall-test-match',
      'hall-test-order',
      'hall-test-builder',
      'hall-test-spot',
      'hall-test-failure',
      'hall-test-mc2',
    ],
  },
  {
    slug: 'struktura-prompta',
    title: 'Структура промпта',
    description:
      'Отработайте каркас промпта: роль, задача, контекст, формат и ограничения.',
    exerciseIds: [
      'prompt-test-sc',
      'prompt-test-tf',
      'prompt-test-mc',
      'prompt-test-fill',
      'prompt-test-match',
      'prompt-test-order',
      'prompt-test-builder',
      'prompt-test-spot',
      'prompt-test-failure',
      'prompt-test-mc2',
    ],
  },
]

export const ALL_EXERCISE_TYPES_IN_TEST = [
  'singleChoice',
  'trueFalse',
  'multipleChoice',
  'fillTheBlank',
  'matchPairs',
  'orderSteps',
  'promptBuilder',
  'spotTheHallucination',
  'failureModePicker',
] as const

export function getTestBySlug(slug: string): TopicTest | undefined {
  return testsIndex.find((t) => t.slug === slug)
}
