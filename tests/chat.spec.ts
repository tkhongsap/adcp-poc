import { test, expect } from '@playwright/test';

const API_BASE = 'http://localhost:3001';

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

  test('should render structured backend conversations without [object Object] after reload', async ({ page, request }) => {
    const conversationId = `conv_structured_ui_${Date.now()}`;
    const conversationTitle = `Structured UI Test ${Date.now()}`;

    const createResponse = await request.post(`${API_BASE}/api/chat/conversations`, {
      data: {
        id: conversationId,
        title: conversationTitle,
        messages: [
          { role: 'user', content: 'Pause Apex campaign' },
          {
            role: 'assistant',
            content: [
              { type: 'text', text: 'I will pause Apex campaign now.' },
              {
                type: 'tool_use',
                id: 'toolu_test_pause_ui',
                name: 'update_media_buy',
                input: {
                  media_buy_id: 'mb_apex_motors_q1',
                  updates: { set_status: { status: 'paused' } }
                }
              }
            ]
          },
          {
            role: 'user',
            content: [
              {
                type: 'tool_result',
                tool_use_id: 'toolu_test_pause_ui',
                content: '{"success":true}'
              }
            ]
          },
          {
            role: 'assistant',
            content: [
              { type: 'text', text: 'Apex campaign is paused.' }
            ]
          }
        ]
      }
    });

    expect(createResponse.status()).toBe(200);

    try {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const conversationButton = page.getByRole('button', { name: conversationTitle }).first();
      await expect(conversationButton).toBeVisible({ timeout: 15000 });
      await conversationButton.click();

      await expect(page.getByText('I will pause Apex campaign now.')).toBeVisible({ timeout: 10000 });
      await expect(page.getByText('Apex campaign is paused.')).toBeVisible({ timeout: 10000 });
      await expect(page.getByText('[object Object]', { exact: true })).toHaveCount(0);

      await page.evaluate(() => localStorage.clear());
      await page.reload();
      await page.waitForLoadState('networkidle');

      const conversationButtonAfterReload = page.getByRole('button', { name: conversationTitle }).first();
      await expect(conversationButtonAfterReload).toBeVisible({ timeout: 15000 });
      await conversationButtonAfterReload.click();

      await expect(page.getByText('I will pause Apex campaign now.')).toBeVisible({ timeout: 10000 });
      await expect(page.getByText('Apex campaign is paused.')).toBeVisible({ timeout: 10000 });
      await expect(page.getByText('[object Object]', { exact: true })).toHaveCount(0);
    } finally {
      await request.delete(`${API_BASE}/api/chat/conversations/${conversationId}`);
    }
  });
});
