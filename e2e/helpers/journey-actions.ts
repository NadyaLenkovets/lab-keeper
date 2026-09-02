import { expect, type Locator, type Page } from '@playwright/test'
import type { ActivityConfig } from '../../src/types/activity'
import { demoJourney } from '../../src/content/demo/demo-journey'
import { flattenJourney } from '../../src/utils/journey'

export function demoActivities(): ActivityConfig[] {
  return flattenJourney(demoJourney).map((s) => s.activity)
}

export function exerciseShell(page: Page): Locator {
  return page.getByRole('group', { name: 'Интерактивное упражнение' }).last()
}

export async function clickCheck(shell: Locator) {
  const check = shell.getByTestId('exercise-check')
  await expect(check).toBeEnabled({ timeout: 15_000 })
  await check.click()
}

async function expectAnswered(shell: Locator) {
  await expect(
    shell
      .getByText('Верно!')
      .or(shell.getByText('Частично верно'))
      .or(shell.getByText('Неверно'))
      .first(),
  ).toBeVisible({ timeout: 15_000 })
}

function optionLabel(
  activity: Extract<ActivityConfig, { options: { id: string; label: string }[] }>,
  optionId: string,
): string {
  const option = activity.options.find((o) => o.id === optionId)
  if (!option) throw new Error(`Option ${optionId} in ${activity.id}`)
  return option.label
}

async function readOrderStepIds(page: Page): Promise<string[]> {
  return page.locator('[data-testid^="order-step-row-"]').evaluateAll((nodes) =>
    nodes.map((node) =>
      node.getAttribute('data-testid')!.replace('order-step-row-', ''),
    ),
  )
}

async function sortOrderSteps(page: Page, correctOrderIds: string[]) {
  const targetKey = correctOrderIds.join(',')
  const maxAttempts = correctOrderIds.length * 8

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const ids = await readOrderStepIds(page)
    if (ids.join(',') === targetKey) return

    const mismatchIndex = ids.findIndex((id, i) => id !== correctOrderIds[i])
    if (mismatchIndex < 0) return

    const wantId = correctOrderIds[mismatchIndex]
    const currentIdx = ids.indexOf(wantId)
    if (currentIdx > mismatchIndex) {
      await page.getByTestId(`order-step-up-${wantId}`).click()
    } else if (currentIdx < mismatchIndex) {
      await page.getByTestId(`order-step-down-${wantId}`).click()
    }
  }

  const final = await readOrderStepIds(page)
  if (final.join(',') !== targetKey) {
    throw new Error(
      `Order steps mismatch: expected ${targetKey}, got ${final.join(',')}`,
    )
  }
}

/** Длинный ответ с ключевыми словами для локальной оценки demo. */
function freeAnswerFor(
  activity: Extract<ActivityConfig, { keywords: string[] }>,
): string {
  const words = activity.keywords.join(' ')
  return `Развёрнутый ответ для проверки: ${words}. Это практический пример с конкретным вредом и смыслом.`
}

export async function answerActivity(page: Page, activity: ActivityConfig) {
  const shell = exerciseShell(page)
  await shell.scrollIntoViewIfNeeded()

  switch (activity.type) {
    case 'singleChoice': {
      const label = optionLabel(activity, activity.correctOptionIds[0])
      await page
        .getByRole('radiogroup', { name: activity.prompt })
        .getByRole('radio', { name: label })
        .click()
      break
    }
    case 'multipleChoice': {
      const group = page.getByRole('group', { name: activity.prompt })
      for (const id of activity.correctOptionIds) {
        await group
          .getByRole('checkbox', { name: optionLabel(activity, id) })
          .click()
      }
      break
    }
    case 'trueFalse': {
      const label = activity.correctAnswer ? 'Верно' : 'Неверно'
      await shell.getByRole('radio', { name: label, exact: true }).click()
      break
    }
    case 'fillTheBlank': {
      for (const blank of activity.blanks) {
        await shell
          .getByTestId(`fill-blank-${blank.id}`)
          .fill(blank.correctAnswers[0])
      }
      break
    }
    case 'orderSteps': {
      await sortOrderSteps(page, activity.correctOrderIds)
      break
    }
    case 'matchPairs': {
      for (const pair of activity.pairs) {
        const drop = page.getByTestId(`match-pair-drop-${pair.leftId}`)
        await page.getByTestId(`match-pair-drag-${pair.rightId}`).click()
        await drop.click()
        await expect(drop).toContainText(pair.rightLabel)
      }
      break
    }
    case 'freeResponse':
    case 'explainLikeImFive':
    case 'teachBack':
    case 'giveYourExample':
    case 'buildTheBridge': {
      await shell.getByRole('textbox').fill(freeAnswerFor(activity))
      break
    }
    default: {
      const _never: never = activity
      throw new Error(`Unsupported activity: ${JSON.stringify(_never)}`)
    }
  }

  await clickCheck(shell)
  await expectAnswered(shell)
}

export async function answerAndNext(page: Page, activity: ActivityConfig) {
  await answerActivity(page, activity)
  const next = page.getByTestId('exercise-next')
  await expect(next).toBeVisible()
  await next.click()
}

export async function completeDemoJourney(page: Page) {
  await page.goto('/create')
  await page.getByTestId('start-demo').click()
  await expect(page).toHaveURL(/\/journey\/demo$/)

  const activities = demoActivities()
  for (let i = 0; i < activities.length; i += 1) {
    const activity = activities[i]
    const isLast = i === activities.length - 1
    if (isLast) {
      await answerActivity(page, activity)
      // после последнего ответа «Далее» завершает journey
      const next = page.getByTestId('exercise-next')
      await expect(next).toBeVisible()
      await next.click()
    } else {
      await answerAndNext(page, activity)
    }
  }

  await expect(
    page.getByRole('heading', { name: 'Journey завершён' }),
  ).toBeVisible({ timeout: 15_000 })
}
