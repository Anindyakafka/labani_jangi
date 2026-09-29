import { defineConfig } from '@playwright/test';

// Preserve Edge as the default; an explicit executable path enables local Chromium runs without changing app dependencies.
const runtime = globalThis as typeof globalThis & { process?: { env?: Record<string, string | undefined> } };
const executablePath = runtime.process?.env?.PLAYWRIGHT_EXECUTABLE_PATH;
const browser = executablePath
  ? { launchOptions: { executablePath } }
  : { channel: 'msedge' as const };

export default defineConfig({
  testDir: './tests',
  use: { baseURL: 'http://127.0.0.1:4321', ...browser },
  webServer: { command: 'npm run preview -- --host 127.0.0.1', url: 'http://127.0.0.1:4321', reuseExistingServer: true },
  projects: [
    { name: 'desktop', use: { viewport: { width: 1440, height: 1000 } } },
    { name: 'mobile', use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1 } },
  ],
});
