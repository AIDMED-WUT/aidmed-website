import { test, expect } from '@playwright/test';

const BASE = '/aidmed-website';

const ALL_PAGES = [
  `${BASE}/`,
  `${BASE}/zespol`,
  `${BASE}/seminaria`,
  `${BASE}/publikacje`,
  `${BASE}/projekty`,
  `${BASE}/kontakt`,
  `${BASE}/en/`,
  `${BASE}/en/team`,
  `${BASE}/en/seminars`,
  `${BASE}/en/publications`,
  `${BASE}/en/projects`,
  `${BASE}/en/contact`,
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
    await page.goto(`${BASE}/seminaria`);
    // SeminarCard renders as <article> inside year <section> groups
    await expect(page.locator('main article').first()).toBeVisible();
  });

  test('English seminars list shows at least one seminar article', async ({ page }) => {
    await page.goto(`${BASE}/en/seminars`);
    await expect(page.locator('main article').first()).toBeVisible();
  });

  test('publications page shows at least one section with publications', async ({ page }) => {
    await page.goto(`${BASE}/publikacje`);
    // Each publication type is a <section> containing PublicationItem components
    await expect(page.locator('main section').first()).toBeVisible();
  });

  test('team page has at least one team member card', async ({ page }) => {
    await page.goto(`${BASE}/zespol`);
    await expect(page.locator('main article, main li, main .card').first()).toBeVisible();
  });

  test('projects page shows at least one project details element', async ({ page }) => {
    await page.goto(`${BASE}/projekty`);
    await expect(page.locator('main details').first()).toBeVisible();
  });
});
