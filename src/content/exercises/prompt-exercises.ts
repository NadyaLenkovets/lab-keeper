import type { ExerciseConfig } from '@/types/exercise'

// Prompt structure topic
export const promptExercises: Record<string, ExerciseConfig> = {
  "prompt-test-tf": {
    "id": "prompt-test-tf",
    "type": "trueFalse",
    "prompt": "Блок «формат ответа» задаёт, в каком виде нужен результат (список, JSON, таблица).",
    "correctAnswer": true,
    "explanation": {
      "correct": "Формат снижает хаос: модель знает структуру — список, JSON, markdown и т.д.",
      "incorrect": "Формат — не роль и не температура. Это описание вида итогового ответа."
    }
  },
  "prompt-test-mc": {
    "id": "prompt-test-mc",
    "type": "multipleChoice",
    "prompt": "Какие элементы входят в каркас сильного промпта? (выберите все верные)",
    "options": [
      {
        "id": "a",
        "label": "Роль"
      },
      {
        "id": "b",
        "label": "Случайный emoji в каждом ответе"
      },
      {
        "id": "c",
        "label": "Контекст и ограничения"
      },
      {
        "id": "d",
        "label": "Формат ответа"
      }
    ],
    "correctOptionIds": [
      "a",
      "c",
      "d"
    ],
    "explanation": {
      "correct": "Роль, контекст, ограничения и формат — базовые блоки. Emoji не обязателен и не делает промпт сильнее.",
      "incorrect": "Сильный промпт структурирован: кто отвечает, на каких данных, в каком виде и с какими лимитами."
    }
  },
  "prompt-inline-match": {
    "id": "prompt-inline-match",
    "type": "matchPairs",
    "prompt": "Сопоставьте блок промпта и его роль:",
    "pairs": [
      {
        "leftId": "l1",
        "leftLabel": "Роль",
        "rightId": "r1",
        "rightLabel": "Кто говорит и с какой экспертизой"
      },
      {
        "leftId": "l2",
        "leftLabel": "Формат",
        "rightId": "r2",
        "rightLabel": "Вид ответа: список, JSON, таблица"
      },
      {
        "leftId": "l3",
        "leftLabel": "Ограничения",
        "rightId": "r3",
        "rightLabel": "Длина, тон, запреты"
      }
    ],
    "explanation": {
      "correct": "Роль, формат и ограничения — разные блоки с разными задачами.",
      "incorrect": "Не путайте формат (как выглядит ответ) с ролью (кто отвечает)."
    }
  },
  "prompt-inline-failure": {
    "id": "prompt-inline-failure",
    "type": "failureModePicker",
    "prompt": "Какие сбои вероятны у этого промпта?",
    "weakPrompt": "Объясни API. Сделай нормально.",
    "options": [
      {
        "id": "a",
        "label": "Нет контекста и входных данных"
      },
      {
        "id": "b",
        "label": "Не задан формат ответа"
      },
      {
        "id": "c",
        "label": "Слишком общая формулировка задачи"
      },
      {
        "id": "d",
        "label": "Промпт уже идеален"
      }
    ],
    "correctOptionIds": [
      "a",
      "b",
      "c"
    ],
    "explanation": {
      "correct": "Без контекста, формата и чёткой задачи ответ будет размытым.",
      "incorrect": "«Нормально» и «объясни API» — не бриф, модель будет гадать."
    }
  },
  "prompt-test-sc": {
    "id": "prompt-test-sc",
    "type": "singleChoice",
    "prompt": "Какой блок задаёт перспективу ответа (эксперт, редактор)?",
    "options": [
      {
        "id": "a",
        "label": "Ограничения"
      },
      {
        "id": "b",
        "label": "Роль"
      },
      {
        "id": "c",
        "label": "Температура"
      }
    ],
    "correctOptionIds": [
      "b"
    ],
    "explanation": {
      "correct": "Роль задаёт «кто» отвечает.",
      "incorrect": "Температура — параметр генерации, не роль."
    }
  },
  "prompt-test-fill": {
    "id": "prompt-test-fill",
    "type": "fillTheBlank",
    "prompt": "Заполните: явные ___ уменьшают «воду» в ответе.",
    "blanks": [
      {
        "id": "b1",
        "correctAnswers": [
          "ограничения",
          "ограничение",
          "лимиты"
        ]
      }
    ],
    "explanation": {
      "correct": "Лимиты по длине, тону и содержанию направляют модель.",
      "incorrect": "Без ограничений ответ часто расплывчатый."
    }
  },
  "prompt-test-match": {
    "id": "prompt-test-match",
    "type": "matchPairs",
    "prompt": "Сопоставьте блок промпта и его назначение:",
    "pairs": [
      {
        "leftId": "l1",
        "leftLabel": "Роль",
        "rightId": "r1",
        "rightLabel": "Кто отвечает и с какой позиции"
      },
      {
        "leftId": "l2",
        "leftLabel": "Контекст",
        "rightId": "r2",
        "rightLabel": "Входные данные и фон задачи"
      },
      {
        "leftId": "l3",
        "leftLabel": "Формат",
        "rightId": "r3",
        "rightLabel": "Вид итогового ответа (список, JSON, таблица)"
      }
    ],
    "explanation": {
      "correct": "Роль, контекст и формат — три разных блока с разными задачами в промпте.",
      "incorrect": "Не путайте: роль — не формат, контекст — не ограничение по длине (хотя связаны)."
    }
  },
  "prompt-test-order": {
    "id": "prompt-test-order",
    "type": "orderSteps",
    "prompt": "Расставьте логичный порядок сборки сильного промпта:",
    "steps": [
      {
        "id": "s1",
        "label": "Задать роль (кто отвечает)"
      },
      {
        "id": "s2",
        "label": "Дать контекст и данные"
      },
      {
        "id": "s3",
        "label": "Сформулировать задачу"
      },
      {
        "id": "s4",
        "label": "Указать формат и ограничения"
      }
    ],
    "correctOrderIds": [
      "s1",
      "s2",
      "s3",
      "s4"
    ],
    "explanation": {
      "correct": "Сначала роль и контекст, затем задача, в конце — формат и ограничения для предсказуемого ответа.",
      "incorrect": "Формат до задачи обычно мешает: модели нужно понять «что делать», прежде чем «в каком виде»."
    }
  },
  "prompt-test-builder": {
    "id": "prompt-test-builder",
    "type": "promptBuilder",
    "prompt": "Соберите промпт для краткого структурированного резюме текста:",
    "slots": [
      {
        "slotId": "role",
        "title": "Роль",
        "hint": "Кто отвечает",
        "correctBlockId": "pb-role"
      },
      {
        "slotId": "context",
        "title": "Контекст",
        "hint": "Входные данные",
        "correctBlockId": "pb-ctx"
      },
      {
        "slotId": "task",
        "title": "Задача",
        "hint": "Что сделать",
        "correctBlockId": "pb-task"
      },
      {
        "slotId": "format",
        "title": "Формат",
        "hint": "Вид ответа",
        "correctBlockId": "pb-fmt"
      }
    ],
    "blocks": [
      {
        "id": "pb-role",
        "label": "Роль: аналитик",
        "preview": "Ты — бизнес-аналитик."
      },
      {
        "id": "pb-ctx",
        "label": "Контекст: отчёт",
        "preview": "Ниже отчёт за квартал (текст приложен пользователем)."
      },
      {
        "id": "pb-task",
        "label": "Задача: резюме",
        "preview": "Сделай резюме: цель, 3 вывода, 2 риска."
      },
      {
        "id": "pb-fmt",
        "label": "Формат: markdown",
        "preview": "Формат: markdown с заголовками ##."
      },
      {
        "id": "pb-noise",
        "label": "Без структуры",
        "preview": "Напиши как попало, главное — душевно."
      }
    ],
    "explanation": {
      "correct": "Резюме без роли, контекста, задачи и формата часто получается размытым.",
      "incorrect": "«Напиши как попало» — не замена явной структуре промпта."
    }
  },
  "prompt-test-spot": {
    "id": "prompt-test-spot",
    "type": "spotTheHallucination",
    "prompt": "Найдите галлюцинации в «сравнении продуктов» от AI:",
    "responseLabel": "Ответ AI",
    "segments": [
      {
        "id": "s1",
        "text": "Оба инструмента подходят для черновиков. "
      },
      {
        "id": "h1",
        "text": "Продукт A сертифицирован FDA для лечения тревожности"
      },
      {
        "id": "s2",
        "text": ", а "
      },
      {
        "id": "h2",
        "text": "продукт B используют 100% команд NASA"
      },
      {
        "id": "s3",
        "text": " — такие детали нужно проверять отдельно."
      }
    ],
    "correctSpanIds": [
      "h1",
      "h2"
    ],
    "explanation": {
      "correct": "Конкретные регуляторные статусы и «100% NASA» без источника — классические выдуманные детали.",
      "incorrect": "Подозрительны сверхконкретные цифры и авторитеты без ссылки на первоисточник."
    }
  },
  "prompt-test-failure": {
    "id": "prompt-test-failure",
    "type": "failureModePicker",
    "prompt": "Какие сбои вероятны для этого промпта к отчёту?",
    "weakPrompt": "Напиши отчёт по этим данным.",
    "options": [
      {
        "id": "a",
        "label": "Нет роли и рамки анализа"
      },
      {
        "id": "b",
        "label": "Не задан формат (структура, объём)"
      },
      {
        "id": "c",
        "label": "«Вода» и общие фразы без выводов"
      },
      {
        "id": "d",
        "label": "Модель откажется отвечать"
      }
    ],
    "correctOptionIds": [
      "a",
      "b",
      "c"
    ],
    "explanation": {
      "correct": "Без роли, формата и критериев отчёт часто размытый; отказ маловероятен — скорее плохое качество.",
      "incorrect": "Модель ответит, но промпт не направляет: кто пишет, для кого, в каком виде."
    }
  },
  "prompt-test-mc2": {
    "id": "prompt-test-mc2",
    "type": "multipleChoice",
    "prompt": "Что стоит явно указать в промпте для табличного ответа? (все верные)",
    "options": [
      {
        "id": "a",
        "label": "Заголовки колонок"
      },
      {
        "id": "b",
        "label": "Максимум строк"
      },
      {
        "id": "c",
        "label": "Случайный анекдот в начале"
      },
      {
        "id": "d",
        "label": "Что делать, если данных нет"
      }
    ],
    "correctOptionIds": [
      "a",
      "b",
      "d"
    ],
    "explanation": {
      "correct": "Формат таблицы = структура + лимиты + поведение при пустых данных.",
      "incorrect": "Анекдот не улучшает таблицу; без структуры модель угадывает вид ответа."
    }
  },
}
