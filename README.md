# Lab Keeper

Учебный проект модуля 4: AI-расширение образовательной платформы.

Продукт — единая SPA **Lab Keeper**. База: [prompt-lab](https://github.com/NadyaLenkovets/prompt-lab) (статьи, 9 типов упражнений, тесты) + [knowledge-journey](https://github.com/NadyaLenkovets/knowledge-journey) (Hono, OpenRouter, Journey). Не копия соседнего `Prompt-Engineering-Academy`.

Репозиторий: [github.com/NadyaLenkovets/lab-keeper](https://github.com/NadyaLenkovets/lab-keeper).

**Что видит ученик:** статьи, тесты и маршруты по промпт-инжинирингу. Вопрос на `/ask` ищется в материалах платформы, не в интернете. Ответ с карточками источников.

**Что не делали:** аккаунты, Postgres/pgvector, мобильная вёрстка, деплой на Vercel. API — локальный Hono (`npm run dev:server`). На Vercel из коробки не поедет: фронт статикой отдастся, процесс на порту 3001 там не поднимается.

## Соответствие заданию

| Требование | Где смотреть |
|---|---|
| RAG с источниками | `/ask`, `POST /api/ask`, `data/rag-index.json` |
| Не меньше двух AI-действий (не общий чат) | Спроси / Объясни проще / Слабые места / Что дальше + grounded Journey |
| Персональный контекст | `/profile`, `localStorage` `lab-keeper-learner`; сжатый профиль уходит в промпт |
| Интеграция в UI | шапка: Статьи, Тесты, Journey, Спросить, Профиль |
| Итерации и решения | [DEV_NOTES.md](./DEV_NOTES.md) |
| Промпты | [PROMPTS.md](./PROMPTS.md), код в `server/prompts.ts` |
| Деплой | не сдаём; проверка локально через `npm run dev:all` |

## Стек

| Технология | Зачем |
|---|---|
| React 19 + TypeScript + Vite | Тот же SPA, что в модулях 1–2 |
| React Router 7 | Статьи, тесты, journey, `/ask`, `/profile` |
| Chakra UI v3 | Визуал Prompt Lab (`#161616` / `#84CC16`), desktop ≥ 1280px |
| Hono | API, ключ OpenRouter не в браузере |
| OpenRouter | Chat + embeddings (`openai/text-embedding-3-small`) |
| JSON-индекс + cosine / lexical | Учебный корпус без векторной БД |
| Zod | Контракты ответов AI |
| Vitest + Playwright | Нарезка, ранжирование, smoke e2e |

## Как устроен RAG

```text
статьи / тесты / demo-journey
        ↓ npm run rag:index
  data/rag-index.json          (в репозитории, ~53 чанка с векторами)
  data/ai-overlay.json         (локально, после генерации AI-journey)
        ↓ retrieve: cosine 75% + lexical 25%, порог 0.08
  LLM отвечает только по найденным фрагментам
        ↑
  профиль ученика (localStorage; в индекс не пишется)
```

- Чанки: статья по секциям; упражнение/тест — вопрос + ответ + пояснение; journey — summary и блоки.
- Поиск: `POST /api/rag/search`. Нет совпадений по действию «спроси» — фиксированный ответ «в материалах нет», модель не вызывается.
- Индекс перечитывается по mtime. `/ask` показывает число чанков и векторов из `/api/health`.
- Новый AI-journey после генерации дописывается в overlay, retrieve его видит. `npm run rag:index` overlay не затирает.

**AI-действия**

1. Спроси платформу — `/ask`, ответ + карточки источников со ссылками внутрь платформы.
2. Объясни проще — кнопка у абзаца статьи (тот же RAG, другой промпт).
3. Слабые места — после теста и на отчёте journey, опора на профиль.
4. Что изучить дальше — 2–3 шага внутри Lab Keeper.
5. Journey из базы — `/create`, retrieve по теме, метка «Сгенерировано AI по материалам платформы».
6. Пресет «Как связано» на `/ask`.

Без ключа OpenRouter: статьи, тесты, demo-journey, профиль. `/ask` показывает найденные фрагменты без генерации.

## Запуск

Node.js 20+, npm. В Windows:

```bash
npm install
copy .env.example .env
```

В `.env` ключ с [openrouter.ai/keys](https://openrouter.ai/keys):

```env
OPENROUTER_API_KEY=sk-or-v1-...
OPENROUTER_MODEL=openrouter/free
OPENROUTER_EMBEDDING_MODEL=openai/text-embedding-3-small
PORT=3001
```

Индекс с эмбеддингами уже в `data/rag-index.json`. Пересобирать нужно только если меняли контент:

```bash
npm run rag:index
```

Фронт + API:

```bash
npm run dev:all
```

Откройте http://localhost:5173/main (ширина окна ≥ 1280px).

### Команды

| Команда | Назначение |
|---|---|
| `npm run dev:all` | Vite `:5173` + Hono `:3001` |
| `npm run rag:index` | Пересобрать статический индекс (overlay не трогает) |
| `npm run rag:verify` | Проверить cosine по уже записанным векторам |
| `npm run test` | Vitest |
| `npm run test:e2e` | Playwright (preview без Hono: `/api/ask` мокается) |
| `npm run lint` | ESLint |

Первый e2e: `npx playwright install chromium`.

## Сценарий проверки

1. **Главная** — бренд Lab Keeper, три статьи, карточки Тесты / Journey / Спросить.
2. **Статья** — «Галлюцинации» → **Объясни проще** у абзаца.
3. **Спросить** — «Что я знаю о галлюцинациях?» → текст и блок **Источники**, клик открывает `/article/galjucinacii`. Вопрос вне материалов (например, рецепт борща) → «в материалах нет».
4. **Тест** — Тесты → тема → после финиша «слабые места» и «что дальше». **Профиль** — проценты сохранились.
5. **Journey** — Создать → **Пройти demo** (без ключа). С ключом: тема «структура промпта» → метка AI; на `/ask` этот маршрут может появиться в источниках. Счётчик чанков на `/ask` вырастет.
6. **Профиль** — экспорт JSON / удалить все данные. Прогресс только в этом браузере.

## Маршруты

| URL | Экран |
|---|---|
| `/main` | Главная (`/` редирект сюда) |
| `/article/:slug` | Статья + упражнения |
| `/tests`, `/tests/:slug` | Тесты |
| `/create`, `/journey/:id`, `/journey/:id/report` | Journey |
| `/ask` | Спроси платформу |
| `/profile` | Прогресс, экспорт, удаление |

Slug тем: `kak-rabotayut-llm`, `galjucinacii`, `struktura-prompta`.

## Документы процесса

- [DEV_NOTES.md](./DEV_NOTES.md) — цель, решения, шаги 1–10, известные ограничения
- [PROMPTS.md](./PROMPTS.md) — зачем каждый системный промпт
- [e2e/TEST-PLAN.md](./e2e/TEST-PLAN.md) — план Playwright
