import { test, expect } from '@playwright/test';

const API_BASE = 'http://localhost:3001';

test.describe('AdCP Tools Integration', () => {
  test.describe('DISCOVER Tools', () => {
    test('get_products - should return available products', async ({ request }) => {
      const response = await request.post(`${API_BASE}/api/tools/get_products`, {
        data: {}
      });
      
      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.products).toBeDefined();
      expect(Array.isArray(data.products)).toBe(true);
      expect(data.products.length).toBeGreaterThan(0);
    });

    test('get_products - should filter by category', async ({ request }) => {
      const response = await request.post(`${API_BASE}/api/tools/get_products`, {
        data: { category: 'Sports' }
      });
      
      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
    });

    test('list_creative_formats - should return format list', async ({ request }) => {
      const response = await request.post(`${API_BASE}/api/tools/list_creative_formats`, {
        data: {}
      });
      
      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.formats || data.creative_formats).toBeDefined();
    });

    test('list_creative_formats - should filter by type', async ({ request }) => {
      const response = await request.post(`${API_BASE}/api/tools/list_creative_formats`, {
        data: { format_type: 'display' }
      });
      
      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
    });

    test('list_authorized_properties - should return properties', async ({ request }) => {
      const response = await request.post(`${API_BASE}/api/tools/list_authorized_properties`, {
        data: {}
      });
      
      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.properties || data.authorized_properties).toBeDefined();
    });
  });

  test.describe('MONITOR Tools', () => {
    test('get_media_buy_delivery - should return all delivery metrics', async ({ request }) => {
      const response = await request.post(`${API_BASE}/api/tools/get_media_buy_delivery`, {
        data: {}
      });
      
      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.metrics).toBeDefined();
      expect(Array.isArray(data.metrics)).toBe(true);
      expect(data.count).toBeGreaterThan(0);
      
      const metric = data.metrics[0];
      expect(metric.summary).toBeDefined();
      expect(metric.summary.impressions).toBeDefined();
      expect(metric.summary.clicks).toBeDefined();
      expect(metric.by_device).toBeDefined();
      expect(metric.by_geo).toBeDefined();
    });

    test('get_media_buy_delivery - should filter by media_buy_id', async ({ request }) => {
      const response = await request.post(`${API_BASE}/api/tools/get_media_buy_delivery`, {
        data: { media_buy_id: 'mb_apex_motors_q1' }
      });
      
      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
    });

    test('get_media_buy_delivery - should support breakdown parameter', async ({ request }) => {
      const response = await request.post(`${API_BASE}/api/tools/get_media_buy_delivery`, {
        data: { breakdown: 'device' }
      });
      
      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
    });
  });

  test.describe('OPTIMISE Tools', () => {
    test('update_media_buy - should handle valid updates', async ({ request }) => {
      const response = await request.post(`${API_BASE}/api/tools/update_media_buy`, {
        data: {
          media_buy_id: 'mb_apex_motors_q1',
          updates: { status: 'active' }
        }
      });
      
      expect(response.status()).toBe(200);
    });

    test('provide_performance_feedback - should accept valid feedback', async ({ request }) => {
      const response = await request.post(`${API_BASE}/api/tools/provide_performance_feedback`, {
        data: {
          media_buy_id: 'mb_apex_motors_q1',
          feedback_type: 'conversion_data',
          data: { conversions: 100 }
        }
      });
      
      expect(response.status()).toBe(200);
    });
  });

  test.describe('CREATE Tools', () => {
    test('create_media_buy - should validate required fields', async ({ request }) => {
      const response = await request.post(`${API_BASE}/api/tools/create_media_buy`, {
        data: {
          name: 'Test Campaign',
          budget: 10000
        }
      });
      
      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toBeDefined();
    });

    test('create_media_buy - should create with all required fields', async ({ request }) => {
      const response = await request.post(`${API_BASE}/api/tools/create_media_buy`, {
        data: {
          brand_name: 'Test Brand',
          product_id: 'prod_espn_premium',
          budget: 10000,
          start_time: '2026-02-01T00:00:00Z',
          end_time: '2026-02-28T23:59:59Z'
        }
      });
      
      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
    });
  });
});
