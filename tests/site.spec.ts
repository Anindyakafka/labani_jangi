import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  // Keep browser checks offline from the real analytics service.
  await page.route('https://cloud.umami.is/script.js', route => route.fulfill({ contentType: 'application/javascript', body: '' }));
});

test('dark mode follows system then preserves explicit choice across languages', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', '#121010');
  const toggle = page.getByRole('button', { name: 'Dark mode' });
  await expect(toggle).toHaveAttribute('aria-pressed', 'true');
  await toggle.click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', '#ede3cf');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', '#ede3cf');
  await toggle.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', '#121010');
  await page.locator('[data-language-switch]').click();
  await expect(page.getByRole('button', { name: 'ডার্ক মোড' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', '#121010');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.locator('.site-header nav a[href="/bn/archive/"]').click();
  await page.locator('a[href="/bn/archive/a-language-for-resistance/"]').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', '#121010');
});

test('theme follows system until a light/dark choice is saved and updates browser chrome live', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/bn/');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', '#ede3cf');

  await page.emulateMedia({ colorScheme: 'dark' });
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', '#121010');
  const toggle = page.getByRole('button', { name: 'ডার্ক মোড' });
  await toggle.click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', '#ede3cf');

  await page.emulateMedia({ colorScheme: 'dark' });
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.goto('/bn/works/');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', '#ede3cf');
  await expect(page.getByRole('button', { name: 'ডার্ক মোড' })).toHaveAttribute('aria-pressed', 'false');

  const routes = [
    '/', '/practice/', '/works/', '/artworks/', '/artworks/others/', '/artworks/palestine/', '/artworks/political/',
    '/archive/', '/archive/a-language-for-resistance/', '/about/', '/contact/', '/privacy/', '/terms/', '/404.html',
    '/bn/', '/bn/practice/', '/bn/works/', '/bn/artworks/', '/bn/artworks/others/', '/bn/artworks/palestine/', '/bn/artworks/political/',
    '/bn/archive/', '/bn/archive/a-language-for-resistance/', '/bn/about/', '/bn/contact/', '/bn/privacy/', '/bn/terms/', '/bn/404/',
  ];
  for (const theme of ['light', 'dark'] as const) {
    await page.evaluate(value => localStorage.setItem('labani-theme', value), theme);
    for (const route of routes) {
      await page.goto(route);
      const dark = theme === 'dark';
      await expect(page.locator('html'), `${route} root theme`).toHaveAttribute('data-theme', theme);
      await expect(page.locator('meta[name="theme-color"]'), `${route} browser chrome`).toHaveAttribute('content', dark ? '#121010' : '#ede3cf');
      await expect(page.locator('[data-theme-toggle]'), `${route} toggle state`).toHaveAttribute('aria-pressed', String(dark));
    }
  }
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
  await expect(page.locator('[data-ground-map]')).toHaveAttribute('data-map-motion', 'static');
  await expect(page.locator('[data-ground-state-outline]')).toBeHidden();
  await expect(page.locator('[data-ground-map-fragments]')).toBeHidden();
  const districts = page.locator('[data-ground-district]');
  await expect(districts).toHaveCount(23);
  const motion = await page.locator('[data-ground-district="nadia"]').evaluate(element => ({ animation: getComputedStyle(element).animationName, duration: getComputedStyle(element).transitionDuration }));
  expect(motion.animation).toBe('none');
  expect(motion.duration).toBe('0s');
  expect(await page.locator('[data-ground-district="nadia"]').evaluate(element => getComputedStyle(element).opacity)).toBe('1');
  const nadia = page.locator('[data-ground-district="nadia"]');
  await nadia.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('[data-ground-selection-name]')).toHaveText('Nadia');
  await expect(page.locator('[data-ground-selection-link]')).toHaveAttribute('href', '/about/');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);

  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(page.locator('[data-ground-map]')).toHaveAttribute('data-map-motion', 'scrubbed');
  await expect(page.locator('[data-scroll-reveal]').first()).toHaveAttribute('data-reveal-state', 'scroll');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('[data-ground-map]')).toHaveAttribute('data-map-motion', 'static');
  await expect(page.locator('[data-scroll-reveal]').first()).toHaveAttribute('data-reveal-state', 'static');
  await expect(page.locator('[data-ground-district="nadia"]')).toHaveCSS('opacity', '1');
});

test('the state outline scrubs into districts, Nadia lands last, and reverse scroll restores the outline', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  const map = page.locator('[data-ground-map]');
  const outline = page.locator('[data-ground-state-outline]');
  const firstFragment = page.locator('[data-ground-map-fragment="alipurduar"]');
  const nadia = page.locator('[data-ground-map-fragment="nadia"]');
  await expect(page.locator('html')).toHaveAttribute('data-map-motion-pending', 'true');
  await expect(outline).toHaveCSS('opacity', '1');
  await expect(firstFragment).toHaveCSS('opacity', '0');
  await page.evaluate(() => window.dispatchEvent(new Event('scroll')));
  await expect(map).toHaveAttribute('data-map-motion', 'scrubbed');
  await expect(outline).toHaveCount(1);
  await expect(page.locator('[data-ground-map-fragment]')).toHaveCount(23);
  await expect(outline).toHaveCSS('opacity', '1');
  await expect(firstFragment).toHaveCSS('opacity', '0');
  await expect(nadia).toHaveCSS('opacity', '0');
  expect(await page.locator('.pin-spacer').count()).toBe(0);

  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = 'auto';
    window.scrollTo(0, 360);
  });
  await expect.poll(async () => Number(await firstFragment.evaluate(element => getComputedStyle(element).opacity))).toBeGreaterThan(0.05);
  await expect(nadia).toHaveCSS('opacity', '0');

  await page.evaluate(() => window.scrollTo(0, 1200));
  await expect.poll(async () => Number(await nadia.evaluate(element => getComputedStyle(element).opacity))).toBeGreaterThan(0.95);
  const homeFill = await nadia.evaluate(element => getComputedStyle(element).fill);
  const activeTheme = await page.locator('html').getAttribute('data-theme');
  expect(homeFill).toContain(activeTheme === 'dark' ? '243, 140, 134' : '141, 17, 22');
  await expect(outline).toHaveCSS('opacity', '0');

  await page.evaluate(() => window.scrollTo(0, 0));
  await expect.poll(async () => Number(await outline.evaluate(element => getComputedStyle(element).opacity))).toBeGreaterThan(0.95);
  await expect(firstFragment).toHaveCSS('opacity', '0');
});

test('editorial sections reveal calmly on the home, Practice, Works and Archive pages in both locales', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  await page.evaluate(() => window.dispatchEvent(new Event('scroll')));
  await expect(page.locator('[data-scroll-reveal]').first()).toHaveAttribute('data-reveal-state', 'scroll');
  const firstExploreCard = page.locator('.ground-path-card').first();
  await expect(firstExploreCard).toHaveCSS('opacity', '0');
  await firstExploreCard.scrollIntoViewIfNeeded();
  await expect(firstExploreCard).toHaveCSS('opacity', '1');
  expect(await page.locator('.pin-spacer').count()).toBe(0);

  for (const route of ['/bn/', '/practice/', '/bn/practice/', '/works/', '/bn/works/', '/archive/', '/bn/archive/']) {
    await page.goto(route);
    await page.evaluate(() => window.dispatchEvent(new Event('scroll')));
    await expect(page.locator('[data-scroll-reveal]').first(), `${route} initializes reveal state`).toHaveAttribute('data-reveal-state', /^(scroll|visible)$/);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${route} has no horizontal overflow`).toBe(true);
  }
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
      await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', theme === 'dark' ? '#121010' : '#ede3cf');
      const nadia = page.locator('[data-ground-district="nadia"]');
      await expect(nadia).toHaveAttribute('aria-label', locale.nadia);
      const palette = await page.evaluate(() => {
        const rgb = (value: string) => {
          const hex = value.trim().match(/^#([\da-f]{6})$/i)?.[1];
          if (hex) return [0, 2, 4].map(index => Number.parseInt(hex.slice(index, index + 2), 16));
          const numbers = value.match(/[\d.]+/g)?.slice(0, 3).map(Number) ?? [0, 0, 0];
          return numbers.length === 3 ? numbers : [0, 0, 0];
        };
        const luminance = (value: string) => {
          const channels = rgb(value).map(channel => {
            const linear = channel / 255;
            return linear <= 0.04045 ? linear / 12.92 : ((linear + 0.055) / 1.055) ** 2.4;
          });
          return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
        };
        const contrast = (first: string, second: string) => {
          const values = [luminance(first), luminance(second)].sort((a, b) => b - a);
          return (values[0] + 0.05) / (values[1] + 0.05);
        };
        const header = document.querySelector('.site-header') as HTMLElement;
        const themeToggle = document.querySelector('[data-theme-toggle]') as HTMLElement;
        const map = document.querySelector('[data-ground-map]') as HTMLElement;
        const bodyBackground = getComputedStyle(document.body).backgroundColor;
        const headerBackground = getComputedStyle(header).backgroundColor;
        const headerSurface = headerBackground.includes(', 0)') ? bodyBackground : headerBackground;
        const toggleBackground = getComputedStyle(themeToggle).backgroundColor;
        const toggleSurface = toggleBackground.includes(', 0)') ? headerSurface : toggleBackground;
        return {
          bodyBackground,
          navText: contrast(getComputedStyle(header.querySelector('nav a')!).color, headerSurface),
          toggleText: contrast(getComputedStyle(themeToggle).color, toggleSurface),
          mapHome: contrast(getComputedStyle(map).getPropertyValue('--ground-map-home').trim(), getComputedStyle(map).getPropertyValue('--ground-map-land').trim()),
          mapBorder: contrast(getComputedStyle(map).getPropertyValue('--ground-map-boundary').trim(), getComputedStyle(map).getPropertyValue('--ground-map-land-light').trim()),
        };
      });
      expect(palette.bodyBackground).toBe(theme === 'dark' ? 'rgb(18, 16, 16)' : 'rgb(237, 227, 207)');
      expect(palette.navText, `${locale.lang}/${theme} navigation contrast`).toBeGreaterThanOrEqual(4.5);
      expect(palette.toggleText, `${locale.lang}/${theme} theme-toggle contrast`).toBeGreaterThanOrEqual(4.5);
      expect(palette.mapHome, `${locale.lang}/${theme} Nadia/map contrast`).toBeGreaterThanOrEqual(3);
      expect(palette.mapBorder, `${locale.lang}/${theme} boundary/land contrast`).toBeGreaterThanOrEqual(3);

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
