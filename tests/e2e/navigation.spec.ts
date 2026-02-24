import { test, expect } from '@playwright/test';

const BASE = '/aidmed-website';

const NAV_LINKS = [
  { label: /Strona główna/i, href: `${BASE}/` },
  { label: /Zespół/i, href: `${BASE}/zespol` },
  { label: /Seminaria/i, href: `${BASE}/seminaria` },
  { label: /Publikacje/i, href: `${BASE}/publikacje` },
  { label: /Projekty/i, href: `${BASE}/projekty` },
  { label: /Kontakt/i, href: `${BASE}/kontakt` },
];

test.describe('Polish homepage navigation', () => {
  test('loads and h1 contains AIDMED', async ({ page }) => {
    await page.goto(`${BASE}/`);
    await expect(page.locator('h1').first()).toContainText('AIDMED');
  });

  test('all nav links are present with correct hrefs', async ({ page }) => {
    await page.goto(`${BASE}/`);
    for (const { label, href } of NAV_LINKS) {
      const link = page.getByRole('link', { name: label }).first();
      await expect(link).toBeVisible();
      const linkHref = await link.getAttribute('href');
      expect(linkHref).toBe(href);
    }
  });

  test('clicking each nav link navigates successfully', async ({ page }) => {
    for (const { label, href } of NAV_LINKS) {
      await page.goto(`${BASE}/`);
      const link = page.getByRole('link', { name: label }).first();
      const [response] = await Promise.all([
        page.waitForResponse((r) => r.url().endsWith(href) || r.url().includes(href)),
        link.click(),
      ]);
      expect(response.status()).toBe(200);
    }
  });
});
