import { expect, test } from '@playwright/test'

const healthyApi = {
  ok: true,
  modelConfigured: true,
  model: 'openrouter/free',
  ragChunks: 40,
}

test.describe('Lab Keeper — главная, статьи, ask', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/health', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(healthyApi),
      })
    })
  })

  test('главная Lab Keeper и карточки статей', async ({ page }) => {
    await page.goto('/main')
    await expect(page.getByText('Lab Keeper').first()).toBeVisible()
    await expect(
      page.getByRole('heading', { name: 'Lab Keeper' }),
    ).toBeVisible()
    await expect(page.getByRole('link', { name: 'Спросить' }).first()).toBeVisible()
    await expect(page.getByText('Галлюцинации').first()).toBeVisible()
  })

  test('корень редиректит на /main', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL(/\/main$/)
  })

  test('статья открывается с кнопкой объяснить', async ({ page }) => {
    await page.goto('/article/galjucinacii')
    await expect(
      page.getByRole('heading', { name: /Галлюцинации/ }).first(),
    ).toBeVisible()
    await expect(page.getByTestId('explain-btn').first()).toBeVisible()
  })

  test('спросить показывает ответ и источники', async ({ page }) => {
    await page.route('**/api/ask', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          action: 'ask',
          mode: 'grounded',
          answer:
            'Галлюцинация — уверенное, но ложное утверждение модели.',
          sources: [
            {
              id: 'article:galjucinacii:s1',
              title: 'Галлюцинации — определение',
              sourceType: 'article',
              url: '/article/galjucinacii',
              snippet: 'Уверенные, но ложные утверждения модели.',
              score: 0.91,
            },
          ],
        }),
      })
    })
    await page.goto('/ask')
    await page.getByTestId('ask-submit').click()
    await expect(page.getByTestId('ask-result')).toBeVisible()
    await expect(page.getByTestId('ask-sources')).toBeVisible()
    await page.getByRole('link', { name: 'Галлюцинации — определение' }).click()
    await expect(page).toHaveURL(/\/article\/galjucinacii/)
  })

  test('профиль: экспорт и очистка', async ({ page }) => {
    await page.goto('/profile')
    await expect(page.getByRole('heading', { name: 'Профиль' })).toBeVisible()
    await expect(page.getByTestId('export-profile')).toBeVisible()
    await page.getByTestId('clear-profile').click()
    await expect(page.getByText('ещё не начато').first()).toBeVisible()
  })
})
