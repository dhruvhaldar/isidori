import { test, expect } from '@playwright/test';

test.describe('Isidori E2E', () => {
  test('Home page loads', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Isidori/);
    await expect(page.locator('h1')).toContainText('Geometric Control Theory');
    const img = page.locator('img[alt="Disturbance Decoupling Demo"]');
    await expect(img).toBeVisible();
    await expect(page.locator('footer')).toContainText('Dhruv Haldar');
    await expect(page.locator('footer')).toContainText('MIT License');
  });

  test('Linear Systems page computes V*', async ({ page }) => {
    await page.goto('/linear');
    page.on('dialog', dialog => console.log(`Dialog message: ${dialog.message()}`));
    await page.click('text=Compute V*');
    await expect(page.locator('legend').filter({ hasText: 'V* Basis Matrix' })).toBeVisible({ timeout: 10000 });
  });

  test.skip('Nonlinear Systems page computes relative degree', async ({ page }) => {
    await page.goto('/nonlinear');
    page.on('dialog', dialog => console.log(`Dialog message: ${dialog.message()}`));
    
    await page.getByPlaceholder('x1, x2, x3').fill('x1, x2');
    await page.getByPlaceholder('x2, -sin(x1) - x2').fill('0, 0');
    await page.getByPlaceholder('0, 1').fill('1, 0');
    await page.getByPlaceholder('x1').fill('x1');
    
    await page.click('text=Compute Relative Degree');
    
    await expect(page.locator('text=Relative Degree (r):')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=1')).toBeVisible();
  });

  test('Simulate page runs simulation', async ({ page }) => {
    await page.goto('/simulate');
    await page.click('text=Simulate Response');
    await expect(page.locator('.recharts-surface').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=DDP Solved & Applied')).toBeVisible();
  });
});
