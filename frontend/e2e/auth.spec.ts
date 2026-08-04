import { test, expect } from '@playwright/test';

test.describe('Authentication Flows', () => {
  test('should display login page correctly', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: /login/i })).toBeVisible();
    await expect(page.getByPlaceholder(/email/i)).toBeVisible();
    await expect(page.getByPlaceholder(/password/i)).toBeVisible();
  });

  test('should show validation errors on empty submission', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Assert some validation message appears
    await expect(page.getByText(/email is required/i)).toBeVisible();
  });

  // More advanced tests require a mocked or seeded database
});
