# Dev Notes — Lab Keeper

## Goal

Собрать единую платформу из Prompt Lab (модуль 1) и Knowledge Journey (модуль 2), добавить RAG по корпусу, персональный контекст и AI-действия — не общий чат.

Репозиторий: https://github.com/NadyaLenkovets/lab-keeper

## Decisions

- Каркас — Knowledge Journey (Hono, OpenRouter). Контент и 9 типов упражнений — Prompt Lab.
- RAG: JSON-индекс, cosine если есть embeddings, иначе lexical overlap. Без pgvector/Qdrant.
- Эмбеддинги и LLM — OpenRouter. Индекс коммитим, чтобы не жечь лимиты на каждый clone.
- Профиль только в `localStorage` (`lab-keeper-learner`). В индекс не попадает.
- Генерация journey подмешивает retrieve по теме (grounded), `origin: ai`.
- UI: шапка Lab Keeper — Статьи, Тесты, Journey, Спросить, Профиль.

## Iterations

### 1. Каркас

Скопирован Knowledge Journey, подключены страницы статей и тестов Prompt Lab, бренд Lab Keeper, `DEV_NOTES.md`.

### 2. Единый UI

Маршруты `/main`, `/article/:slug`, `/tests`, `/create`, `/ask`, `/profile`. Главная показывает оба мира.

### 3. Чанкинг

Статья по секциям (заголовок + абзацы). Упражнения/тесты — Q&A. Journey — summary + блок. Unit-тесты на нарезку.

### 4. Индекс и поиск

`npm run rag:index` → `data/rag-index.json`. `POST /api/rag/search` и retrieve внутри ask.

### 5. Спроси платформу

`/ask` + `POST /api/ask`. Ответ grounded или chunks-only без ключа. Карточки источников со ссылками.

### 6. Профиль

Запись открытия статьи, финиша теста и journey. Экспорт / очистка. В промпт — `compactLearnerSummary`.

### 7. Объясни проще

Кнопка на абзацах и callout статьи. Тот же RAG, другой системный промпт.

### 8. Слабые места и что дальше

Панель после теста и на отчёте journey.

### 9. Journey из базы

`generate-journey` делает retrieve по теме и добавляет фрагменты в промпт. Метка origin.

### 10. Сдача

README, PROMPTS.md, e2e на `/ask` и главную.

## Problems / findings

- Два SPA нельзя просто «склеить маршрутами»: в KJ уже лежал контент Prompt Lab, но страницы статей/тестов не были в роутере.
- `--env-file=.env.*` в gitignore прятал бы `.env.example` — оставили исключение.
- Preview Playwright без Hono: `/api/ask` в e2e мокается, поиск корпуса проверяется юнитами и ручным `dev:all`.
- Эмбеддинги OpenRouter могут быть недоступны на free: тогда индекс лексический, RAG всё равно возвращает источники.
