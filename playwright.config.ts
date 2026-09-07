import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests',
  use: { baseURL: 'http://localhost:4321', channel: 'msedge' },
  webServer: { command: 'npm run preview -- --host 127.0.0.1', url: 'http://localhost:4321', reuseExistingServer: true },
  projects: [{name:'desktop', use:{viewport:{width:1440,height:1000}}}, {name:'mobile',use:{viewport:{width:390,height:844}}}],
});
