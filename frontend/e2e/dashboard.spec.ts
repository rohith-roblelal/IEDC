import { test, expect } from '@playwright/test';

test.describe('Dashboard and Protected Routes', () => {
  test('should redirect to login if unauthenticated', async ({ page }) => {
    await page.goto('/dashboard');
    // We expect the app to push the user back to login
    await expect(page).toHaveURL(/.*login/);
  });
});
