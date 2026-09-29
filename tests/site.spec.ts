import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  // Keep browser checks offline from the real analytics service.
  await page.route('https://cloud.umami.is/script.js', route => route.fulfill({ contentType: 'application/javascript', body: '' }));
});

test('dark mode follows system then preserves explicit choice across languages', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  const toggle = page.getByRole('button', { name: 'Dark mode' });
  await expect(toggle).toHaveAttribute('aria-pressed', 'true');
  await toggle.click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await toggle.focus();
  await page.keyboard.press('Enter');
  await page.locator('[data-language-switch]').click();
  await expect(page.getByRole('button', { name: 'ডার্ক মোড' })).toHaveAttribute('aria-pressed', 'true');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.locator('.site-header nav a[href="/bn/archive/"]').click();
  await page.locator('a[href="/bn/archive/a-language-for-resistance/"]').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
});

test('Bangla switch translates pages and preserves locale and section', async ({ page }, testInfo) => {
  await page.goto('/works/');
  await page.locator('[data-language-switch]').click();
  await expect(page).toHaveURL('/bn/works/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'bn');
  await expect(page.locator('h1')).toContainText('কথোপকথনে ছবি');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://labanijangi.com/bn/works/');
  expect((await page.locator('body').innerText()).replace('English', '')).not.toMatch(/[a-zA-Z]{2,}/);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.goto('/bn/');
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: testInfo.outputPath('bangla-home.png'), fullPage: true });
  await expect(page.locator('[data-ground-district]')).toHaveCount(23);
  await expect(page.locator('[data-ground-district="nadia"]')).toHaveAttribute('aria-label', 'নদিয়া');
  await page.locator('.site-header nav a[href="/bn/archive/"]').click();
  await page.locator('a[href="/bn/archive/a-language-for-resistance/"]').click();
  await expect(page).toHaveURL('/bn/archive/a-language-for-resistance/');
  await expect(page.locator('h1')).toHaveText('প্রতিরোধের ভাষা');
  await expect(page.locator('time')).toContainText('২০২৫');
  await expect(page.locator('.prose')).toContainText('সৌম্যদীপ');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('lang', 'bn');
  await page.locator('[data-language-switch]').click();
  await expect(page).toHaveURL('/archive/a-language-for-resistance/');
  await expect(page.locator('h1')).toHaveText('A Language for Resistance');
  await page.goto('/bn/404/');
  await expect(page.getByRole('link', { name: 'প্রথম পাতায় ফিরুন' })).toHaveAttribute('href', '/bn/');
});

test('analytics configuration is production-only and event links remain usable', async ({ page }) => {
  await page.goto('/contact/');
  const tracker = page.locator('script[data-website-id]');
  await expect(tracker).toHaveCount(1);
  await expect(tracker).toHaveAttribute('data-website-id', 'c0819d04-f244-4caf-8922-e89e57123ae6');
  await expect(tracker).toHaveAttribute('data-domains', 'labanijangi.com,www.labanijangi.com');
  await expect(page.locator('.contact-button')).toHaveAttribute('data-umami-event', 'instagram-click');
  await page.goto('/archive/');
  await expect(page.locator('.source-row[data-umami-event]')).toHaveCount(3);
  await page.locator('a[href="/archive/a-language-for-resistance/"]').click();
  await expect(page.locator('h1')).toHaveText('A Language for Resistance');
  await expect(page.locator('script[data-website-id]')).toHaveCount(1);
});

test('home, navigation and published archive work without layout overflow', async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await expect(page).toHaveTitle(/Labani Jangi/);
  await expect(page.locator('h1')).toContainText('Labani');
  await expect(page.locator('[data-ground-district]')).toHaveCount(23);
  await expect(page.locator('[data-ground-district="nadia"]')).toHaveAttribute('aria-label', 'Nadia');
  await expect(page.getByRole('link', { name: 'ODbL 1.0' })).toHaveAttribute('href', 'https://opendatacommons.org/licenses/odbl/1-0/');
  await page.screenshot({ path: testInfo.outputPath('home.png'), fullPage: true });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'About' }).click();
  await expect(page).toHaveURL('/about/');
  await page.goto('/archive/');
  await page.locator('a[href="/archive/a-language-for-resistance/"]').click();
  await expect(page.locator('h1')).toHaveText('A Language for Resistance');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://labanijangi.com/archive/a-language-for-resistance/');
  expect(errors).toEqual([]);
});

test('sitemap and missing page', async ({ page, request }) => {
  const sitemap = await request.get('/sitemap.xml');
  expect(await sitemap.text()).toContain('https://labanijangi.com/archive/a-language-for-resistance/');
  expect(await sitemap.text()).toContain('https://labanijangi.com/bn/privacy/');
  await page.goto('/404.html');
  await expect(page.getByRole('link', { name: 'Return to the home page' })).toBeVisible();
});

test('sharing and legal pages have complete localized metadata', async ({ page }) => {
  await page.goto('/privacy/');
  await expect(page).toHaveTitle('Privacy policy : Labani Jangi');
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', 'https://labanijangi.com/social-card.png');
  await expect(page.locator('link[rel="manifest"]')).toHaveAttribute('href', '/site.webmanifest');
  await expect(page.locator('main')).toContainText('Umami');
  await page.goto('/bn/terms/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'bn');
  await expect(page.locator('main')).toContainText('ব্যবহারের শর্তাবলি');
});

test('the political and Palestine collections publish every reviewed preview', async ({ page }) => {
  await page.goto('/artworks/political/');
  await expect(page.locator('.archive-art-card')).toHaveCount(329);
  await expect(page.locator('.archive-art-card img').first()).toHaveAttribute('loading', 'lazy');
  await page.locator('.archive-art-card').first().click();
  await expect(page.locator('[data-artwork-dialog]')).toBeVisible();
  await page.getByRole('button', { name: 'Close artwork viewer' }).click();
  await page.goto('/artworks/palestine/');
  await expect(page.locator('.archive-art-card')).toHaveCount(26);
  await page.goto('/bn/artworks/others/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'bn');
  await expect(page.locator('.archive-art-card')).toHaveCount(194);
});

test('districts are operable, correctly labelled, and lead to the right story', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  const districts = page.locator('[data-ground-district]');
  await expect(districts).toHaveCount(23);
  const semantics = await districts.evaluateAll(paths => paths.every(path => path.getAttribute('role') === 'button' && path.getAttribute('tabindex') === '0' && Boolean(path.getAttribute('aria-label'))));
  expect(semantics).toBe(true);
  expect(await page.locator('[data-ground-district] title').count()).toBe(0);

  for (const width of [320, 375, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    const metrics = await page.evaluate(() => ({ width: innerWidth, scrollWidth: document.documentElement.scrollWidth }));
    expect(metrics.scrollWidth, `horizontal overflow at ${width}px`).toBeLessThanOrEqual(metrics.width);
    await expect(districts).toHaveCount(23);
  }

  const nadia = page.locator('[data-ground-district="nadia"]');
  await nadia.hover();
  const tooltip = page.locator('[data-ground-map-tooltip]');
  await expect(tooltip).toHaveText('Nadia · My home district');
  const tooltipBounds = await tooltip.boundingBox();
  expect(tooltipBounds).not.toBeNull();
  expect(tooltipBounds!.x).toBeGreaterThanOrEqual(0);
  expect(tooltipBounds!.x + tooltipBounds!.width).toBeLessThanOrEqual(1440);
  await nadia.click();
  await expect(page.locator('[data-ground-selection-name]')).toHaveText('Nadia');
  await expect(page.locator('[data-ground-selection-summary]')).toHaveText('My roots are in Nadia, West Bengal.');
  await expect(page.locator('[data-ground-selection-link]')).toHaveAttribute('href', '/about/');
  await expect(nadia).toHaveAttribute('aria-pressed', 'true');

  const kolkata = page.locator('[data-ground-district="kolkata"]');
  await kolkata.focus();
  await page.keyboard.press('Space');
  await expect(page.locator('[data-ground-selection-name]')).toHaveText('Kolkata');
  await expect(page.locator('[data-ground-selection-summary]')).toContainText('23 districts');
  await expect(page.locator('[data-ground-selection-link]')).toBeHidden();
  await expect(kolkata).toHaveAttribute('aria-pressed', 'true');
  expect(errors).toEqual([]);
});

test('touch users can select Nadia and tiny districts from the localized picker', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'Touch coverage runs in the mobile browser project.');
  await page.goto('/bn/');
  const nadia = page.locator('[data-ground-district="nadia"]');
  await nadia.tap();
  await expect(page).toHaveURL('/bn/');
  await expect(nadia).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('[data-ground-selection-name]')).toHaveText('নদিয়া');
  await expect(page.locator('[data-ground-selection-link]')).toHaveAttribute('href', '/bn/about/');

  const picker = page.locator('[data-ground-district-picker]');
  await expect(picker).toBeVisible();
  await picker.selectOption('kolkata');
  await expect(page.locator('[data-ground-selection-name]')).toHaveText('কলকাতা');
  await expect(page.locator('[data-ground-selection-summary]')).toContainText('২৩টি জেলা');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('the map stays readable and operable for reduced-motion users', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const districts = page.locator('[data-ground-district]');
  await expect(districts).toHaveCount(23);
  const motion = await page.locator('[data-ground-district="nadia"]').evaluate(element => ({ animation: getComputedStyle(element).animationName, duration: getComputedStyle(element).transitionDuration }));
  expect(motion.animation).toBe('none');
  expect(motion.duration).toBe('0s');
  const nadia = page.locator('[data-ground-district="nadia"]');
  await nadia.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('[data-ground-selection-name]')).toHaveText('Nadia');
  await expect(page.locator('[data-ground-selection-link]')).toHaveAttribute('href', '/about/');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('the map stays within the viewport at every requested width, locale, and theme', async ({ page }) => {
  for (const locale of [
    { route: '/', lang: 'en', nadia: 'Nadia' },
    { route: '/bn/', lang: 'bn', nadia: 'নদিয়া' },
  ]) {
    for (const theme of ['light', 'dark'] as const) {
      await page.emulateMedia({ colorScheme: theme });
      await page.goto(locale.route);
      await expect(page.locator('html')).toHaveAttribute('lang', locale.lang);
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
      const nadia = page.locator('[data-ground-district="nadia"]');
      await expect(nadia).toHaveAttribute('aria-label', locale.nadia);
      const mapFill = await nadia.evaluate(element => getComputedStyle(element).fill);
      expect(mapFill).toContain(theme === 'dark' ? '220, 119, 115' : '141, 17, 22');

      for (const width of [320, 375, 768, 1440]) {
        await page.setViewportSize({ width, height: 900 });
        const metrics = await page.evaluate(() => ({ width: innerWidth, scrollWidth: document.documentElement.scrollWidth }));
        expect(metrics.scrollWidth, `${locale.lang}/${theme} horizontal overflow at ${width}px`).toBeLessThanOrEqual(metrics.width);
        await expect(page.locator('[data-ground-district]')).toHaveCount(23);
        if (width <= 840) await expect(page.locator('[data-ground-district-picker]')).toBeVisible();
        else await expect(page.locator('[data-ground-district-picker]')).toBeHidden();
      }
    }
  }
});
