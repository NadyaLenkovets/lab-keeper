# Dev Notes — Lab Keeper

## Goal

Собрать единую платформу из Prompt Lab (модуль 1) и Knowledge Journey (модуль 2), добавить RAG по корпусу, персональный контекст и AI-действия — не общий чат.

Репозиторий: https://github.com/NadyaLenkovets/lab-keeper

## Decisions

- Каркас — Knowledge Journey (Hono, OpenRouter). Контент и 9 типов упражнений — Prompt Lab.
- RAG: JSON-индекс без pgvector/Qdrant. Сборка (`rag:index`) требует эмбеддинги OpenRouter и падает без векторов. Поиск — cosine 75% + lexical 25%; если нет вектора у запроса или чанка, остаётся lexical.
- Эмбеддинги и LLM — OpenRouter. Индекс коммитим, чтобы не жечь лимиты на каждый clone.
- Профиль только в `localStorage` (`lab-keeper-learner`). В индекс не попадает.
- Генерация journey подмешивает retrieve по теме (grounded), `origin: ai`. Чанки нового маршрута — в `data/ai-overlay.json`, не в коммитимый индекс.
- UI: шапка Lab Keeper — Статьи, Тесты, Journey, Спросить, Профиль.

## Iterations

### 1. Каркас

Скопирован Knowledge Journey, подключены страницы статей и тестов Prompt Lab, бренд Lab Keeper, `DEV_NOTES.md`.

### 2. Единый UI

Маршруты `/main`, `/article/:slug`, `/tests`, `/create`, `/ask`, `/profile`. Главная показывает оба мира.

### 3. Чанкинг

Статья по секциям (заголовок + абзацы). Упражнения/тесты — Q&A. Journey — summary + блок. Unit-тесты на нарезку.

### 4. Индекс и поиск

`npm run rag:index` пишет векторы OpenRouter в `data/rag-index.json`. Поиск: cosine 75% + lexical 25%, порог 0.08. Индекс перечитывается по mtime файла. `/api/health` отдаёт `ragVectors`. Без векторов скрипт падает, а не молча пишет лексический индекс.

### 5. Спроси платформу

`/ask` + `POST /api/ask`. Ответ grounded или chunks-only без ключа. Карточки источников со ссылками.

### 6. Профиль

Запись открытия статьи, финиша теста и journey. Экспорт / очистка. В промпт — `compactLearnerSummary`.

### 7. Объясни проще

Кнопка на абзацах и callout статьи. Тот же RAG, другой системный промпт.

### 8. Слабые места и что дальше

Панель после теста и на отчёте journey.

### 9. Journey из базы

`generate-journey` делает retrieve по теме и добавляет фрагменты в промпт. Метка origin. После успеха чанки пишутся в `data/ai-overlay.json` (не в статический индекс), retrieve склеивает overlay с `rag-index.json`. Повтор с тем же id заменяет чанки. `npm run rag:index` overlay не затирает.

### 10. Сдача

README, PROMPTS.md, e2e на `/ask` и главную.

## Problems / findings

- Два SPA нельзя просто «склеить маршрутами»: в KJ уже лежал контент Prompt Lab, но страницы статей/тестов не были в роутере.
- `--env-file=.env.*` в gitignore прятал бы `.env.example` — оставили исключение.
- Preview Playwright без Hono: `/api/ask` в e2e мокается, поиск корпуса проверяется юнитами и ручным `dev:all`.
- Сбой эмбеддинга запроса не ломает `/ask`: retrieve уходит в lexical по уже записанному индексу. Overlay AI-journey при сбое embed тоже пишется без векторов. Пересобрать статический индекс без векторов нельзя — `rag:index` падает.
