import { test, expect } from '@playwright/test';

const API_BASE = 'http://localhost:3001';

test.describe('API Endpoints', () => {
  test.describe('/api/tools', () => {
    test('GET /api/tools - should list all available tools', async ({ request }) => {
      const response = await request.get(`${API_BASE}/api/tools`);
      expect(response.status()).toBe(200);
      
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.tools).toBeDefined();
      expect(Array.isArray(data.tools)).toBe(true);
      expect(data.tools.length).toBeGreaterThan(0);
      
      const expectedTools = [
        'get_products',
        'list_creative_formats',
        'list_authorized_properties',
        'create_media_buy',
        'get_media_buy_delivery',
        'update_media_buy',
        'provide_performance_feedback'
      ];
      
      for (const tool of expectedTools) {
        expect(data.tools).toContain(tool);
      }
    });

    test('POST /api/tools/get_products - should return products', async ({ request }) => {
      const response = await request.post(`${API_BASE}/api/tools/get_products`, {
        data: {}
      });
      expect(response.status()).toBe(200);
      
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.products).toBeDefined();
      expect(Array.isArray(data.products)).toBe(true);
      expect(data.products.length).toBeGreaterThan(0);
      
      const product = data.products[0];
      expect(product.product_id).toBeDefined();
      expect(product.name).toBeDefined();
      expect(product.category).toBeDefined();
      expect(product.pricing_options).toBeDefined();
    });

    test('POST /api/tools/list_creative_formats - should return creative formats', async ({ request }) => {
      const response = await request.post(`${API_BASE}/api/tools/list_creative_formats`, {
        data: {}
      });
      expect(response.status()).toBe(200);
      
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.formats || data.creative_formats).toBeDefined();
    });

    test('POST /api/tools/list_authorized_properties - should return properties', async ({ request }) => {
      const response = await request.post(`${API_BASE}/api/tools/list_authorized_properties`, {
        data: {}
      });
      expect(response.status()).toBe(200);
      
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.properties || data.authorized_properties).toBeDefined();
    });

    test('POST /api/tools/get_media_buy_delivery - should return delivery metrics', async ({ request }) => {
      const response = await request.post(`${API_BASE}/api/tools/get_media_buy_delivery`, {
        data: {}
      });
      expect(response.status()).toBe(200);
      
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.metrics).toBeDefined();
      expect(Array.isArray(data.metrics)).toBe(true);
      expect(data.count).toBeGreaterThan(0);
      
      if (data.metrics.length > 0) {
        const metric = data.metrics[0];
        expect(metric.media_buy_id).toBeDefined();
        expect(metric.brand).toBeDefined();
        expect(metric.total_budget).toBeDefined();
        expect(metric.total_spend).toBeDefined();
        expect(metric.health).toBeDefined();
        expect(metric.summary).toBeDefined();
      }
    });

    test('POST /api/tools/invalid_tool - should return 404', async ({ request }) => {
      const response = await request.post(`${API_BASE}/api/tools/invalid_tool`, {
        data: {}
      });
      expect(response.status()).toBe(404);
      
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toContain('not found');
    });
  });

  test.describe('/api/chat', () => {
    test('POST /api/chat - should require message', async ({ request }) => {
      const response = await request.post(`${API_BASE}/api/chat`, {
        data: {}
      });
      expect(response.status()).toBe(400);
      
      const data = await response.json();
      expect(data.error).toBeDefined();
    });

    test('GET /api/chat/conversations - should list conversations', async ({ request }) => {
      const response = await request.get(`${API_BASE}/api/chat/conversations`);
      expect(response.status()).toBe(200);
      
      const data = await response.json();
      expect(data.conversations).toBeDefined();
      expect(Array.isArray(data.conversations)).toBe(true);
    });

    test('DELETE /api/chat/nonexistent - should return 404', async ({ request }) => {
      const response = await request.delete(`${API_BASE}/api/chat/nonexistent_conv_id`);
      expect(response.status()).toBe(404);
    });
  });

  test.describe('/api/notifications', () => {
    test('GET /api/notifications/config - should return config', async ({ request }) => {
      const response = await request.get(`${API_BASE}/api/notifications/config`);
      expect(response.status()).toBe(200);
      
      const data = await response.json();
      expect(data).toBeDefined();
    });

    test('GET /api/notifications/draft/nonexistent - should return 404', async ({ request }) => {
      const response = await request.get(`${API_BASE}/api/notifications/draft/nonexistent`);
      expect(response.status()).toBe(404);
    });

    test('POST /api/notifications/send-email - should require draftId', async ({ request }) => {
      const response = await request.post(`${API_BASE}/api/notifications/send-email`, {
        data: {}
      });
      expect(response.status()).toBe(400);
      
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toContain('draftId');
    });
  });
});
