import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  testMatch: '**/*.spec.ts',
  timeout: 30_000,
  retries: 1,
  use: {
    baseURL: 'http://localhost:3000',
    headless: true,
    screenshot: 'only-on-failure',
  },
  webServer: [
    {
      command: 'pnpm --filter @platform/gateway run dev',
      port: 4000,
      reuseExistingServer: true,
      cwd: '..',
    },
    {
      command: 'pnpm --filter @platform/shell run dev',
      port: 3000,
      reuseExistingServer: true,
      cwd: '..',
    },
  ],
});
