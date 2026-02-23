import { test, expect } from '@playwright/test';

const ALL_PAGES = [
  '/',
  '/zespol',
  '/seminaria',
  '/publikacje',
  '/projekty',
  '/kontakt',
  '/en/',
  '/en/team',
  '/en/seminars',
  '/en/publications',
  '/en/projects',
  '/en/contact',
];

test.describe('All pages return 200 and have one h1', () => {
  for (const url of ALL_PAGES) {
    test(url, async ({ page }) => {
      const response = await page.goto(url);
      expect(response?.status()).toBe(200);
      // Each page has exactly one h1 inside <main>
      await expect(page.locator('main h1')).toHaveCount(1);
    });
  }
});

test.describe('Key page content', () => {
  test('seminars list shows at least one seminar article', async ({ page }) => {
    await page.goto('/seminaria');
    // SeminarCard renders as <article> inside year <section> groups
    await expect(page.locator('main article').first()).toBeVisible();
  });

  test('English seminars list shows at least one seminar article', async ({ page }) => {
    await page.goto('/en/seminars');
    await expect(page.locator('main article').first()).toBeVisible();
  });

  test('publications page shows at least one section with publications', async ({ page }) => {
    await page.goto('/publikacje');
    // Each publication type is a <section> containing PublicationItem components
    await expect(page.locator('main section').first()).toBeVisible();
  });

  test('team page has at least one team member card', async ({ page }) => {
    await page.goto('/zespol');
    await expect(page.locator('main article, main li, main .card').first()).toBeVisible();
  });

  test('projects page shows at least one project details element', async ({ page }) => {
    await page.goto('/projekty');
    await expect(page.locator('main details').first()).toBeVisible();
  });
});
