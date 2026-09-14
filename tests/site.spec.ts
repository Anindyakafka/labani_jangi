import { test, expect } from '@playwright/test';
test.beforeEach(async ({ page }) => {
  // Keep browser checks offline from the real analytics service.
  await page.route('https://cloud.umami.is/script.js', route => route.fulfill({ contentType: 'application/javascript', body: '' }));
});
test('Bangla switch translates pages and preserves locale and section', async ({ page }, testInfo) => {
  await page.goto('/#about');
  await page.locator('[data-language-switch]').click();
  await expect(page).toHaveURL('/bn/#about');
  await expect(page.locator('html')).toHaveAttribute('lang', 'bn');
  await expect(page.locator('h1')).toContainText('লাবণী');
  await expect(page.locator('#roots-title')).toHaveText('নদীআর নদিয়া।');
  await expect(page.locator('.district-home title')).toHaveText('নদিয়া');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href','https://labanijangi.com/bn/');
  expect((await page.locator('body').innerText()).replace('English','')).not.toMatch(/[a-zA-Z]{2,}/);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.goto('/bn/');
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path:testInfo.outputPath('bangla-home.png'), fullPage:true });
  await page.locator('.archive-note').click();
  await expect(page).toHaveURL('/bn/archive/a-language-for-resistance/');
  await expect(page.locator('h1')).toHaveText('প্রতিরোধের ভাষা');
  await expect(page.locator('time')).toContainText('২০২৫');
  await expect(page.locator('.prose')).toContainText('সৌম্যদীপ');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('lang','bn');
  await page.locator('[data-language-switch]').click();
  await expect(page).toHaveURL('/archive/a-language-for-resistance/');
  await expect(page.locator('h1')).toHaveText('A Language for Resistance');
  await page.goto('/bn/404/');
  await expect(page.getByRole('link',{name:'প্রথম পাতায় ফিরুন'})).toHaveAttribute('href','/bn/');
});
test('analytics configuration is production-only and event links remain usable', async ({ page }) => {
  await page.goto('/');
  const tracker = page.locator('script[data-website-id]');
  await expect(tracker).toHaveCount(1);
  await expect(tracker).toHaveAttribute('data-website-id', 'c0819d04-f244-4caf-8922-e89e57123ae6');
  await expect(tracker).toHaveAttribute('data-domains', 'labanijangi.com,www.labanijangi.com');
  await expect(page.locator('.contact-button')).toHaveAttribute('data-umami-event', 'instagram-click');
  await expect(page.locator('.source-row[data-umami-event]')).toHaveCount(3);
  await page.locator('.archive-note').click();
  await expect(page.locator('h1')).toHaveText('A Language for Resistance');
  await expect(page.locator('script[data-website-id]')).toHaveCount(1);
});
test('home, navigation and published archive work without layout overflow', async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await expect(page).toHaveTitle(/Labani Jangi/);
  await expect(page.locator('h1')).toContainText('Labani');
  await expect(page.locator('.bengal-map .district')).toHaveCount(23);
  await expect(page.locator('.bengal-map .district-home')).toHaveAttribute('data-district-id', 'nadia');
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
