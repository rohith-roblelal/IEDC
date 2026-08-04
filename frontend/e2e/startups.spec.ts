import { test, expect } from '@playwright/test';

test.describe('Startups Page', () => {
  test('should display startups public page', async ({ page }) => {
    await page.goto('/startups');
    await expect(page.getByRole('heading', { name: /startups/i })).toBeVisible();
  });
});
