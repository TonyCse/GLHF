import { defineConfig } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.test' });

const baseURL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

export default defineConfig({
  testDir: './e2e',
  timeout: 30 * 1000,
  workers: process.env.CI ? 2 : 1,
  expect: {
    timeout: 5 * 1000,
  },
  retries: process.env.CI ? 2 : 1,
  globalSetup: './e2e/global-setup',
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'Chromium',
      use: { browserName: 'chromium' },
    },
    {
      name: 'Firefox',
      use: { browserName: 'firefox' },
    },
    {
      name: 'WebKit',
      use: { browserName: 'webkit' },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: baseURL,
    reuseExistingServer: true,
    timeout: 120 * 1000,
  },
});
