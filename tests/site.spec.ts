import { test, expect } from '@playwright/test';
test('home, navigation and published archive work without layout overflow', async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await expect(page).toHaveTitle(/Labani Jangi/);
  await expect(page.locator('h1')).toContainText('Labani');
  await page.screenshot({ path: testInfo.outputPath('home.png'), fullPage: true });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole('navigation').getByRole('link', {name:'About'}).click();
  await expect(page).toHaveURL(/#about$/);
  await page.locator('.archive-note').click();
  await expect(page.locator('h1')).toHaveText('A Language for Resistance');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href','https://labanijangi.com/archive/a-language-for-resistance/');
  expect(errors).toEqual([]);
});
test('sitemap and missing page', async ({ page, request }) => {
  const sitemap = await request.get('/sitemap.xml');
  expect(await sitemap.text()).toContain('https://labanijangi.com/archive/a-language-for-resistance/');
  await page.goto('/404.html');
  await expect(page.getByRole('link', {name:'Return to the home page'})).toBeVisible();
});
