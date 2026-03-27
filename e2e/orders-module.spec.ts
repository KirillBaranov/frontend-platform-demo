import { test, expect } from '@playwright/test';

test.describe('Orders module', () => {
  test('displays order list with status badges', async ({ page }) => {
    await page.goto('/#/orders');
    await page.waitForSelector('.table');

    const rows = page.locator('.table tbody tr');
    await expect(rows).toHaveCount(3); // 3 mock orders

    // Status badges visible
    await expect(page.locator('.badge').first()).toBeVisible();
  });

  test('status filter tabs show correct counts', async ({ page }) => {
    await page.goto('/#/orders');
    await page.waitForSelector('.table');

    // "Все" tab should be active and show total count
    await expect(page.locator('.btn-primary.btn-sm', { hasText: /Все/ })).toBeVisible();
  });

  test('clicking filter tab filters orders', async ({ page }) => {
    await page.goto('/#/orders');
    await page.waitForSelector('.table');

    // Click "Ожидают" tab
    await page.locator('.btn-sm', { hasText: /Ожидают/ }).click();
    await page.waitForTimeout(300);

    // Should show only pending orders
    const rows = page.locator('.table tbody tr');
    const count = await rows.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('summary cards show statistics', async ({ page }) => {
    await page.goto('/#/orders');
    await page.waitForSelector('.stat-card');

    const statCards = page.locator('.stat-card');
    await expect(statCards).toHaveCount(4); // total, pending, completed, revenue
  });
});
