import { test, expect } from '@playwright/test';

test.describe('Feature flags', () => {
  test('trade-in button hidden by default, visible when flag enabled', async ({ page }) => {
    await page.goto('/#/catalog');
    await page.waitForSelector('.table');

    // Trade-in button should NOT be visible (flag disabled by default)
    await expect(page.locator('button', { hasText: 'Trade-in' })).toHaveCount(0);

    // Enable trade_in_enabled flag
    await page.locator('input[data-flag="trade_in_enabled"]').check();
    await page.waitForTimeout(500);

    // Trade-in button should now be visible
    await expect(page.locator('button', { hasText: 'Trade-in' }).first()).toBeVisible();
  });

  test('network mode changes dashboard label', async ({ page }) => {
    await page.goto('/#/dashboard');
    await page.waitForSelector('.stat-card');

    await expect(page.locator('text=ваш дилерский центр')).toBeVisible();

    await page.locator('input[data-flag="network_mode"]').check();
    await page.waitForTimeout(500);

    await expect(page.locator('text=по всей сети')).toBeVisible();
  });

  test('devtools flag toggles panel and button visibility', async ({ page }) => {
    await page.goto('/#/catalog');

    // DevTools enabled by default — panel visible
    await expect(page.locator('#platform-devtools')).toBeVisible();

    // Disable devtools flag
    await page.locator('input[data-flag="devtools_enabled"]').uncheck();
    await page.waitForTimeout(300);

    // Panel AND toggle button should be hidden
    await expect(page.locator('#platform-devtools')).not.toBeVisible();
    await expect(page.locator('#devtools-toggle')).not.toBeVisible();

    // Re-enable devtools flag
    await page.locator('input[data-flag="devtools_enabled"]').check();
    await page.waitForTimeout(300);

    // Panel should reappear
    await expect(page.locator('#platform-devtools')).toBeVisible();
  });

  test('4 flag toggles visible in header', async ({ page }) => {
    await page.goto('/#/catalog');

    const toggles = page.locator('#flag-toggles label');
    await expect(toggles).toHaveCount(4); // dealer, network, trade-in, devtools
  });
});
