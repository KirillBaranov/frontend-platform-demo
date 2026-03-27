import { test, expect } from '@playwright/test';

test.describe('Analytics module', () => {
  test('displays summary cards', async ({ page }) => {
    await page.goto('/#/analytics');
    await page.waitForSelector('.stat-card');

    const statCards = page.locator('.stat-card');
    await expect(statCards).toHaveCount(4); // avg price, min, max, conversion
  });

  test('displays brand distribution chart', async ({ page }) => {
    await page.goto('/#/analytics');
    await page.waitForSelector('.card-header');

    await expect(page.locator('text=Распределение по маркам')).toBeVisible();
  });

  test('displays stock status chart', async ({ page }) => {
    await page.goto('/#/analytics');
    await page.waitForSelector('.card-header');

    await expect(page.locator('text=Статус склада')).toBeVisible();
    await expect(page.locator('text=В наличии')).toBeVisible();
  });

  test('displays price distribution', async ({ page }) => {
    await page.goto('/#/analytics');
    await page.waitForSelector('.card-header');

    await expect(page.locator('text=Распределение по цене')).toBeVisible();
  });

  test('displays year distribution', async ({ page }) => {
    await page.goto('/#/analytics');
    await page.waitForSelector('.card-header');

    await expect(page.locator('text=По году выпуска')).toBeVisible();
  });
});
