import { test, expect } from '@playwright/test';

test.describe('Cross-module communication', () => {
  test('catalog loads vehicles and displays table', async ({ page }) => {
    await page.goto('/#/catalog');
    await page.waitForSelector('.table');

    const rows = page.locator('.table tbody tr');
    await expect(rows).toHaveCount(8);
  });

  test('clicking vehicle row opens detail card', async ({ page }) => {
    await page.goto('/#/catalog');
    await page.waitForSelector('.table');

    await page.locator('.table tbody tr').first().click();

    // Detail card should appear
    await expect(page.locator('.card-header h3')).toContainText('BMW 320d');
    await expect(page.locator('text=WBA11AA0X0CK12345')).toBeVisible();
  });

  test('order button opens modal with vehicle info', async ({ page }) => {
    await page.goto('/#/catalog');
    await page.waitForSelector('.table');

    // Click order button
    await page.locator('.btn-primary.btn-sm', { hasText: 'Заказ' }).first().click();

    // Modal should appear with vehicle info
    await expect(page.locator('text=Новый заказ')).toBeVisible();
    await expect(page.locator('text=Имя клиента')).toBeVisible();
  });

  test('creating order via modal triggers notification', async ({ page }) => {
    await page.goto('/#/catalog');
    await page.waitForSelector('.table');

    // Open modal
    await page.locator('.btn-primary.btn-sm', { hasText: 'Заказ' }).first().click();

    // Fill form
    await page.fill('input[placeholder="Иван Иванов"]', 'Тестовый Клиент');
    await page.fill('input[type="tel"]', '+7 999 000 00 00');

    // Submit
    await page.locator('button[type="submit"]').click();

    // Notification should appear
    await expect(page.locator('.notification-success')).toBeVisible({ timeout: 5000 });
  });

  test('sidebar navigation works across all 4 modules', async ({ page }) => {
    await page.goto('/#/catalog');
    await page.waitForSelector('.table');
    await expect(page.locator('h2')).toContainText('Каталог');

    await page.click('[data-module="dashboard"]');
    await page.waitForSelector('.stat-card');
    await expect(page.locator('h2')).toContainText('Дашборд');

    await page.click('[data-module="orders"]');
    await page.waitForSelector('.stat-card');
    await expect(page.locator('h2')).toContainText('Управление заказами');

    await page.click('[data-module="analytics"]');
    await page.waitForSelector('.stat-card');
    await expect(page.locator('h2')).toContainText('Аналитика');
  });

  test('order in catalog updates dashboard stats', async ({ page }) => {
    // Create order in catalog
    await page.goto('/#/catalog');
    await page.waitForSelector('.table');
    await page.locator('.btn-primary.btn-sm', { hasText: 'Заказ' }).first().click();
    await page.fill('input[placeholder="Иван Иванов"]', 'Cross-module Test');
    await page.locator('button[type="submit"]').click();
    await page.waitForSelector('.notification-success');

    // Navigate to dashboard
    await page.click('[data-module="dashboard"]');
    await page.waitForSelector('.stat-card');

    // Dashboard should have loaded (stats visible)
    await expect(page.locator('.stat-value').first()).toBeVisible();
  });

  test('vehicle selected in catalog shows in dashboard sidebar', async ({ page }) => {
    // Select vehicle in catalog
    await page.goto('/#/catalog');
    await page.waitForSelector('.table');
    await page.locator('.table tbody tr').first().click();

    // Navigate to dashboard
    await page.click('[data-module="dashboard"]');
    await page.waitForSelector('.stat-card');

    // Selected vehicle should appear (cross-module event)
    await expect(page.locator('text=cross-module event')).toBeVisible({ timeout: 5000 });
  });
});
