import { test, expect } from '@playwright/test';

test.describe('Chat Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should load the chat page', async ({ page }) => {
    await expect(page).toHaveTitle(/Signal42/i);
    await expect(page.locator('body')).toBeVisible();
  });

  test('should display the Signal42 header', async ({ page }) => {
    const header = page.locator('text=Signal42').first();
    await expect(header).toBeVisible({ timeout: 10000 });
  });

  test('should display the new chat button', async ({ page }) => {
    const newChatBtn = page.locator('text=New chat').first();
    await expect(newChatBtn).toBeVisible({ timeout: 10000 });
  });

  test('should display navigation items', async ({ page }) => {
    const searchNav = page.locator('text=Search').first();
    const chatsNav = page.locator('text=Chats').first();
    
    await expect(searchNav).toBeVisible({ timeout: 10000 });
    await expect(chatsNav).toBeVisible({ timeout: 10000 });
  });

  test('should display RECENTS section', async ({ page }) => {
    const recents = page.locator('text=RECENTS').first();
    await expect(recents).toBeVisible({ timeout: 10000 });
  });

  test('should display user profile section', async ({ page }) => {
    const userSection = page.locator('text=User').first();
    await expect(userSection).toBeVisible({ timeout: 10000 });
  });

  test('should have sidebar navigation', async ({ page }) => {
    const sidebar = page.locator('aside, nav, [class*="sidebar"]').first();
    await expect(sidebar).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Chat Functionality', () => {
  test('should be able to click new chat', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const newChatBtn = page.locator('text=New chat').first();
    await expect(newChatBtn).toBeVisible({ timeout: 10000 });
    await newChatBtn.click();
  });

  test('should display welcome screen on initial load', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const mainArea = page.locator('main, [class*="main"], [class*="content"]').first();
    await expect(mainArea).toBeVisible({ timeout: 10000 });
  });
});
