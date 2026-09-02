# Lab Keeper

Библиотекарь [Prompt Lab](https://github.com/NadyaLenkovets/prompt-lab): статьи и тесты из модуля 1, Knowledge Journey из модуля 2, плюс RAG, персональный профиль и AI-действия.

Платформа больше не «полка с книгами». Lab Keeper ищет по своим материалам, помнит прогресс и предлагает следующий шаг.

## Почему такой стек

| Технология | Зачем |
|---|---|
| React 19 + TypeScript + Vite | Тот же SPA, что в модулях 1–2 |
| React Router 7 | Статьи, тесты, journey, `/ask`, `/profile` |
| Chakra UI v3 | Визуал Prompt Lab (`#161616` / `#84CC16`) |
| Hono | API, ключ OpenRouter не в браузере |
| OpenRouter | Chat + embeddings |
| JSON-индекс + cosine / lexical | Учебный корпус без векторной БД |
| Zod | Контракты ответов AI |
| Vitest + Playwright | Оценка, чанки, smoke e2e |

## Как устроено

```text
статьи / тесты / demo-journey
        ↓ npm run rag:index
  data/rag-index.json  +  data/ai-overlay.json (новые AI-journey)
        ↓ retrieve (cosine + lexical)
  /api/ask  →  ответ + источники
        ↑
  профиль ученика (localStorage, сжатый текст в промпт)
```

**Чанки:** статья по секциям; упражнение/тест — вопрос + ответ + пояснение; journey — по блокам.

**AI-действия (не «просто чат»):**

1. Спроси платформу — grounded-ответ с карточками источников
2. Объясни проще — кнопка в статье
3. Слабые места — разбор прогресса
4. Что изучить дальше — следующие шаги внутри платформы
5. Journey из базы — генерация маршрута с опорой на индекс, метка «сгенерировано AI», чанки сразу в поиске

**Персонализация:** `localStorage` ключ `lab-keeper-learner`. Экспорт и удаление на `/profile`. В индекс корпуса профиль не пишется.

## Локальный запуск

Нужны Node.js 20+ и npm.

```bash
cd lab-keeper
npm install
copy .env.example .env
```

В `.env` укажите ключ с [openrouter.ai/keys](https://openrouter.ai/keys):

```env
OPENROUTER_API_KEY=sk-or-v1-...
OPENROUTER_MODEL=openrouter/free
OPENROUTER_EMBEDDING_MODEL=openai/text-embedding-3-small
PORT=3001
```

Собрать векторный индекс (нужен ключ OpenRouter):

```bash
npm run rag:index
```

Запуск фронта и API:

```bash
npm run dev:all
```

Откройте http://localhost:5173/main (ширина окна ≥ 1280px).

Без ключа работают статьи, тесты, demo-journey и профиль. `/ask` покажет найденные фрагменты корпуса.

### Команды

| Команда | Назначение |
|---|---|
| `npm run dev:all` | Vite + Hono |
| `npm run rag:index` | Пересобрать статический `data/rag-index.json` (AI-overlay не трогает) |
| `npm run rag:verify` | Проверить cosine по индексу без нового запроса к API |
| `npm run test` | Vitest |
| `npm run test:e2e` | Playwright (сам поднимает preview) |
| `npm run lint` | ESLint |

Первый e2e: `npx playwright install chromium`.

## Как попробовать

1. **Главная** — http://localhost:5173/main: бренд Lab Keeper, три статьи, карточки Тесты / Journey / Спросить.
2. **Статья** — откройте «Галлюцинации», нажмите **Объясни проще** у абзаца.
3. **Поиск** — шапка **Спросить** → «Что я знаю о галлюцинациях?» → ответ и блок **Источники**, клик открывает статью.
4. **Тест** — Тесты → тема → после финиша кнопки слабых мест и «что дальше»; откройте **Профиль** — проценты сохранились.
5. **Journey** — Создать → **Пройти demo** (без ключа) или сгенерировать тему с ключом (маршрут опирается на корпус и сразу попадает в поиск на `/ask`).
6. **Privacy** — `/profile` → Экспорт JSON / Удалить все данные.

## Маршруты

| URL | Экран |
|---|---|
| `/main` | Главная |
| `/article/:slug` | Статья + упражнения |
| `/tests`, `/tests/:slug` | Тесты |
| `/create`, `/journey/:id`, `/journey/:id/report` | Journey |
| `/ask` | Библиотекарь |
| `/profile` | Прогресс и данные |

Slug тем: `kak-rabotayut-llm`, `galjucinacii`, `struktura-prompta`.

## Документы процесса

- [PLAN.md](./PLAN.md) — концепт и пошаговый план
- [DEV_NOTES.md](./DEV_NOTES.md) — итерации и решения
- [PROMPTS.md](./PROMPTS.md) — промпт-журнал

Учебный MVP. Деплой фронта на Vercel возможен; AI-эндпоинты в этом репозитории рассчитаны на локальный Hono (`npm run dev:server`).
