import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  workers: 1,
  timeout: 90_000,
  expect: {
    timeout: 10_000,
  },
  outputDir: 'test-results/playwright',
  reporter: [['list']],
  use: {
    baseURL: 'http://127.0.0.1:4178',
    headless: true,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'off',
  },
  webServer: [
    {
      command: 'npm run dev:api',
      url: 'http://127.0.0.1:3002/api/healthz',
      reuseExistingServer: true,
      timeout: 60_000,
    },
    {
      command: 'npm run preview -- --host 127.0.0.1 --port 4178',
      url: 'http://127.0.0.1:4178',
      reuseExistingServer: false,
      timeout: 60_000,
    },
  ],
  projects: [
    {
      name: 'chromium-offline',
      use: {
        ...devices['Desktop Chrome'],
        locale: 'en-US',
        serviceWorkers: 'allow',
      },
    },
  ],
});
