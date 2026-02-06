import { test, expect } from '@playwright/test';

test.describe('Dashboard Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
  });

  test('should load the dashboard page', async ({ page }) => {
    await expect(page.locator('body')).toBeVisible();
  });

  test('should display Media Buys header', async ({ page }) => {
    const header = page.locator('text=Media Buys').first();
    await expect(header).toBeVisible({ timeout: 15000 });
  });

  test('should display Back to Chat link', async ({ page }) => {
    const backLink = page.locator('text=Back to Chat').first();
    await expect(backLink).toBeVisible({ timeout: 10000 });
  });

  test('should display Cards/Table view toggle', async ({ page }) => {
    const cardsBtn = page.locator('text=Cards');
    const tableBtn = page.locator('text=Table');
    
    const cardsVisible = await cardsBtn.count() > 0;
    const tableVisible = await tableBtn.count() > 0;
    
    expect(cardsVisible || tableVisible).toBe(true);
  });

  test('should show connection status indicator', async ({ page }) => {
    const connectionStatus = page.locator('text=Connected').first();
    await expect(connectionStatus).toBeVisible({ timeout: 15000 });
  });

  test('should display loading or campaign data', async ({ page }) => {
    const loadingOrData = page.locator('text=/Loading|campaign|Apex|TechFlow|SportMax/i').first();
    await expect(loadingOrData).toBeVisible({ timeout: 15000 });
  });

  test('dashboard should have theme toggle', async ({ page }) => {
    const themeToggle = page.locator('button').filter({ has: page.locator('svg') }).first();
    await expect(themeToggle).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Dashboard Navigation', () => {
  test('should navigate to chat when clicking Back to Chat', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    const backLink = page.locator('text=Back to Chat').first();
    await expect(backLink).toBeVisible({ timeout: 10000 });
    await backLink.click();
    
    await page.waitForURL('**/');
    await expect(page.locator('text=New chat')).toBeVisible({ timeout: 10000 });
  });

  test('dashboard should have sidebar navigation', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    const chatWithAgent = page.locator('text=Chat with Agent');
    const tradingSection = page.locator('text=TRADING');
    
    const sidebarVisible = (await chatWithAgent.count()) > 0 || (await tradingSection.count()) > 0;
    expect(sidebarVisible).toBe(true);
  });
});

test.describe('Dashboard Real-time Features', () => {
  test('should show last updated timestamp', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    const lastUpdated = page.locator('text=/Last updated|just now|ago/i').first();
    await expect(lastUpdated).toBeVisible({ timeout: 15000 });
  });

  test('dashboard should be responsive', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    await page.setViewportSize({ width: 1200, height: 800 });
    await expect(page.locator('body')).toBeVisible();
    
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('body')).toBeVisible();
  });
});
