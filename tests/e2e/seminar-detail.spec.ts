import { test, expect } from '@playwright/test';

// Use the most recent seminar which has an abstract (details toggle)
const SEMINAR_WITH_ABSTRACT = '/seminaria/2025-03-12-holynski-generative-models';
const SEMINAR_EN_WITH_ABSTRACT = '/en/seminars/2025-03-12-holynski-generative-models';

test.describe('Seminar detail page (PL)', () => {
  test('loads and shows h1 with seminar title', async ({ page }) => {
    await page.goto(SEMINAR_WITH_ABSTRACT);
    await expect(page.locator('main h1')).toBeVisible();
    await expect(page.locator('main h1')).not.toBeEmpty();
  });

  test('shows speaker name', async ({ page }) => {
    await page.goto(SEMINAR_WITH_ABSTRACT);
    await expect(page.locator('article dd').first()).toContainText('Hołyński');
  });

  test('shows abstract section', async ({ page }) => {
    await page.goto(SEMINAR_WITH_ABSTRACT);
    await expect(page.getByRole('heading', { name: /streszczenie/i })).toBeVisible();
  });

  test('back link points to seminars list', async ({ page }) => {
    await page.goto(SEMINAR_WITH_ABSTRACT);
    const backLink = page.getByRole('link', { name: /powrót do seminariów/i });
    await expect(backLink).toBeVisible();
    const href = await backLink.getAttribute('href');
    expect(href).toBe('/seminaria');
  });
});

test.describe('Seminar detail page (EN)', () => {
  test('loads and shows h1', async ({ page }) => {
    await page.goto(SEMINAR_EN_WITH_ABSTRACT);
    await expect(page.locator('main h1')).toBeVisible();
    await expect(page.locator('main h1')).not.toBeEmpty();
  });

  test('back link points to English seminars list', async ({ page }) => {
    await page.goto(SEMINAR_EN_WITH_ABSTRACT);
    const backLink = page.getByRole('link', { name: /back to seminars/i });
    await expect(backLink).toBeVisible();
    const href = await backLink.getAttribute('href');
    expect(href).toBe('/en/seminars');
  });
});

test.describe('Seminar card abstract toggle', () => {
  test('details element expands when clicked', async ({ page }) => {
    await page.goto('/seminaria');
    // Find a seminar card that has a <details> element (abstract toggle)
    const details = page.locator('main article details').first();
    await expect(details).toBeVisible();

    // Initially closed
    await expect(details).not.toHaveAttribute('open', '');

    // Click the summary to open
    await details.locator('summary').click();
    await expect(details).toHaveAttribute('open', '');
  });
});
