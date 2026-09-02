import { defineConfig, devices } from '@playwright/test'

const PORT = 4173
const baseURL = `http://127.0.0.1:${PORT}`

export default defineConfig({
  testDir: './e2e/specs',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  timeout: 180_000,
  expect: { timeout: 10_000 },
  reporter: [['list']],
  use: {
    baseURL,
    locale: 'ru-RU',
    trace: 'on-first-retry',
    ...devices['Desktop Chrome'],
    viewport: { width: 1280, height: 720 },
  },
  projects: [{ name: 'chromium', use: { channel: 'chromium' } }],
  webServer: {
    command: 'npm run build && npm run preview -- --host 127.0.0.1 --port 4173',
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
})
