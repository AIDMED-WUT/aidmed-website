import { test, expect } from '@playwright/test';

const BASE = '/aidmed-website';

test.describe('Language switching', () => {
  test('Polish homepage has lang switcher pointing to /en/', async ({ page }) => {
    await page.goto(`${BASE}/`);
    // Language switcher has title="Switch to English" and text "EN"
    const switcher = page.locator('a[title="Switch to English"]');
    await expect(switcher).toBeVisible();
    const href = await switcher.getAttribute('href');
    expect(href).toBe(`${BASE}/en/`);
  });

  test('clicking language switcher from PL navigates to /en/', async ({ page }) => {
    await page.goto(`${BASE}/`);
    await page.locator('a[title="Switch to English"]').click();
    await expect(page).toHaveURL(/\/en\//);
  });

  test('English homepage has lang switcher pointing to /', async ({ page }) => {
    await page.goto(`${BASE}/en/`);
    // Language switcher has title="Przełącz na polski" and text "PL"
    const switcher = page.locator('a[title="Przełącz na polski"]');
    await expect(switcher).toBeVisible();
    const href = await switcher.getAttribute('href');
    expect(href).toBe(`${BASE}/`);
  });

  test('clicking language switcher from EN navigates to /', async ({ page }) => {
    await page.goto(`${BASE}/en/`);
    await page.locator('a[title="Przełącz na polski"]').click();
    await expect(page).toHaveURL(new RegExp(`${BASE}/?$`));
  });

  test('Polish homepage has lang="pl"', async ({ page }) => {
    await page.goto(`${BASE}/`);
    const lang = await page.locator('html').getAttribute('lang');
    expect(lang).toBe('pl');
  });

  test('English homepage has lang="en"', async ({ page }) => {
    await page.goto(`${BASE}/en/`);
    const lang = await page.locator('html').getAttribute('lang');
    expect(lang).toBe('en');
  });
});
