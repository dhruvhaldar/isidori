import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://127.0.0.1:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: [
    {
      command: './venv/bin/python -m uvicorn api.index:app --port 8001',
      port: 8001,
      reuseExistingServer: !process.env.CI,
      cwd: '.',
    },
    {
      command: 'pnpm run dev',
      port: 3000,
      reuseExistingServer: !process.env.CI,
      cwd: '.',
      stdout: 'pipe',
      stderr: 'pipe',
    }
  ],
});
