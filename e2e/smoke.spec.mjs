import { test, expect } from '@playwright/test';

test('home page loads', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('text=SkinMetrics')).toBeVisible();
});

test('navigate to portfolio page', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: /Portfolio|Портфель/ }).click();
  await expect(page).toHaveURL(/\/portfolio/);
});
