// initFeedbackLink on a fixture page (ported from wallabout-design/site, tests/feedback.spec.ts).
import { test, expect, type Page } from '@playwright/test';

const link = (page: Page) => page.getByRole('link', { name: 'send feedback' });
const fixture = (name: string, query = '') => `/test/fixture/${name}.html${query}`;

test.beforeEach(({ page }) => {
  page.on('console', (m) => {
    if (m.type() === 'error') throw new Error(`console error: ${m.text()}`);
  });
  page.on('pageerror', (e) => {
    throw e;
  });
});

test('hidden for ordinary visitors', async ({ page }) => {
  await page.goto(fixture('index'));
  await expect(link(page)).toBeHidden();
  expect(await page.evaluate(() => localStorage.length)).toBe(0);
});

test('importing the package does nothing until initFeedbackLink runs', async ({ page }) => {
  await page.goto(fixture('import-only', '?feedback'));
  await page.waitForLoadState('load');
  await expect(link(page)).toBeHidden();
  expect(await page.evaluate(() => localStorage.length)).toBe(0);
});

test('?feedback turns it on, and it stays on for later pages', async ({ page }) => {
  await page.goto(fixture('index', '?feedback'));
  await expect(link(page)).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('feedback'))).toBe('1');
  await page.goto(fixture('about'));
  await expect(link(page)).toBeVisible();
});

test('?feedback=off turns it off again', async ({ page }) => {
  await page.goto(fixture('index', '?feedback'));
  await page.goto(fixture('about', '?feedback=off'));
  await expect(link(page)).toBeHidden();
  expect(await page.evaluate(() => localStorage.length)).toBe(0);
  await page.goto(fixture('index'));
  await expect(link(page)).toBeHidden();
});

test('the email names the site, page, viewport and build', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(fixture('about', '?feedback'));
  const mail = new URL((await link(page).getAttribute('href'))!);
  expect(mail.protocol).toBe('mailto:');
  expect(mail.pathname).toBe('feedback@wallabout.design');
  expect(mail.searchParams.get('subject')).toMatch(/^\[test\] \/test\/fixture\/about\.html #[2-9a-hjkmnp-z]{4}$/);
  const body = mail.searchParams.get('body')!;
  expect(body).toContain('url: ' + page.url());
  expect(body).toMatch(/viewport: 390x844 @\d+(\.\d{1,2})?x\r\n/);
  expect(body).toContain('build: abc1234');
  expect(body).toContain('\r\n');
});

test('the address can be overridden', async ({ page }) => {
  await page.goto(fixture('index', '?feedback&address=notes@example.com'));
  expect(new URL((await link(page).getAttribute('href'))!).pathname).toBe('notes@example.com');
});

test('opens the mail app from this tab, not a pop-up, even from older markup', async ({ page }) => {
  await page.goto(fixture('index', '?feedback'));
  await expect(link(page)).toBeVisible();
  await expect(link(page)).not.toHaveAttribute('target');
});

test('each click gets a new subject code', async ({ page }) => {
  await page.goto(fixture('index', '?feedback'));
  await page.evaluate(() => addEventListener('click', (e) => e.preventDefault(), { capture: true }));
  const subjects = new Set<string>();
  for (let i = 0; i < 3; i++) {
    await link(page).click();
    subjects.add(new URL((await link(page).getAttribute('href'))!).searchParams.get('subject')!);
  }
  expect(subjects.size).toBe(3);
});

// Click without leaving the page (the mailto: would open a mail app), and return the
// email the link would have opened.
async function clickAndRead(page: Page) {
  await page.evaluate(() => addEventListener('click', (e) => e.preventDefault(), { capture: true }));
  await link(page).click();
  return new URL((await link(page).getAttribute('href'))!).searchParams.get('body')!;
}

test('quotes the text highlighted on the page', async ({ page }) => {
  await page.goto(fixture('about', '?feedback'));
  await page.evaluate(() => getSelection()!.selectAllChildren(document.querySelector('h1')!));
  const body = await clickAndRead(page);
  expect(body.startsWith('about this text:\r\n> the about page\r\n')).toBe(true);
});

test('text deselected in the last 3 s still counts', async ({ page }) => {
  await page.goto(fixture('about', '?feedback'));
  await page.evaluate(() => getSelection()!.selectAllChildren(document.querySelector('h1')!));
  await page.evaluate(() => getSelection()!.removeAllRanges());
  expect((await clickAndRead(page)).startsWith('about this text:\r\n> the about page')).toBe(true);
});

test('no quote when nothing is highlighted', async ({ page }) => {
  await page.goto(fixture('about', '?feedback'));
  expect((await clickAndRead(page)).startsWith('what to change')).toBe(true);
});

test('the cleanup function removes the listeners', async ({ page }) => {
  await page.goto(fixture('about', '?feedback'));
  const before = await link(page).getAttribute('href');
  await page.evaluate(() => (window as unknown as { feedbackCleanup: () => void }).feedbackCleanup());
  await page.evaluate(() => getSelection()!.selectAllChildren(document.querySelector('h1')!));
  await clickAndRead(page);
  expect(await link(page).getAttribute('href')).toBe(before);
});

test.describe('fractional zoom', () => {
  test.use({ deviceScaleFactor: 20 / 11 });
  test('the device pixel ratio has at most two decimals', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'only Chromium takes a fractional scale factor');
    await page.goto(fixture('index', '?feedback'));
    expect(new URL((await link(page).getAttribute('href'))!).searchParams.get('body')).toContain(' @1.82x\r\n');
  });
});

// reserve.css, on a page whose footer has a link in the bottom-right corner.
test.describe('reserve.css', () => {
  // The element at the centre of the corner link, once scrolled to the bottom.
  async function cornerHit(page: Page) {
    await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
    return page.evaluate(() => {
      const corner = document.getElementById('corner')!;
      const r = corner.getBoundingClientRect();
      const hit = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
      return hit === corner || corner.contains(hit) ? 'corner' : (hit?.textContent ?? '');
    });
  }
  const removeReserve = (page: Page) => page.evaluate(() => document.querySelector('[data-reserve]')!.remove());
  const pageBottom = (page: Page) =>
    page.evaluate(() => ({
      height: document.documentElement.scrollHeight,
      padding: getComputedStyle(document.body).paddingBottom,
    }));

  for (const width of [360, 1440]) {
    test(`keeps the footer's corner link clickable with feedback on at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await page.goto(fixture('footer', '?feedback'));
      await expect(link(page)).toBeVisible();
      expect(await cornerHit(page)).toBe('corner');
      await page.locator('#corner').click();
      await expect(page).toHaveURL(/about\.html$/);
    });
  }

  test('without it, the feedback link covers the corner link (the fixture shows the problem)', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto(fixture('footer', '?feedback'));
    await expect(link(page)).toBeVisible();
    await removeReserve(page);
    expect(await cornerHit(page)).toBe('send feedback');
  });

  test('changes nothing with feedback off', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto(fixture('footer', '?feedback=off'));
    await expect(link(page)).toBeHidden();
    const withReserve = await pageBottom(page);
    await removeReserve(page);
    expect(withReserve).toEqual(await pageBottom(page));
    expect(withReserve.padding).toBe('0px');
  });
});
