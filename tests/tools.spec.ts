import { test, expect } from '@playwright/test';

const API_BASE = 'http://localhost:3001';

test.describe('AdCP Tools Integration', () => {
  test.describe('DISCOVER Tools', () => {
    test('get_products - should return available products', async ({ request }) => {
      const response = await request.post(`${API_BASE}/api/tools/get_products`, {
        data: {},
      });

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(Array.isArray(data.products)).toBe(true);
      expect(data.products.length).toBeGreaterThan(0);
      expect(data.products[0].product_id).toBeDefined();
    });

    test('get_products - should filter by platform', async ({ request }) => {
      const response = await request.post(`${API_BASE}/api/tools/get_products`, {
        data: { platform: 'facebook_ads' },
      });

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.count).toBeGreaterThan(0);
      for (const product of data.products) {
        expect(product.platform).toBe('facebook_ads');
      }
    });

    test('list_creative_formats - should return format list', async ({ request }) => {
      const response = await request.post(`${API_BASE}/api/tools/list_creative_formats`, {
        data: {},
      });

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(Array.isArray(data.formats)).toBe(true);
      expect(data.formats.length).toBeGreaterThan(0);
    });

    test('list_creative_formats - should filter by type', async ({ request }) => {
      const response = await request.post(`${API_BASE}/api/tools/list_creative_formats`, {
        data: { type: 'display' },
      });

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.filters_applied.type).toBe('display');
      for (const format of data.formats) {
        expect(format.type).toBe('display');
      }
    });

    test('list_authorized_properties - should return properties', async ({ request }) => {
      const response = await request.post(`${API_BASE}/api/tools/list_authorized_properties`, {
        data: {},
      });

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(Array.isArray(data.properties)).toBe(true);
      expect(data.properties.length).toBeGreaterThan(0);
    });
  });

  test.describe('MONITOR Tools', () => {
    test('get_media_buy_delivery - should return all delivery metrics', async ({ request }) => {
      const response = await request.post(`${API_BASE}/api/tools/get_media_buy_delivery`, {
        data: {},
      });

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
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
        data: { media_buy_id: 'mb_apex_motors_q1' },
      });

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.metrics).toBeDefined();
      expect(data.metrics.media_buy_id).toBe('mb_apex_motors_q1');
    });

    test('get_media_buy_delivery - should filter by platform', async ({ request }) => {
      const response = await request.post(`${API_BASE}/api/tools/get_media_buy_delivery`, {
        data: { platform: 'google_ads' },
      });

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.count).toBeGreaterThan(0);
      for (const metric of data.metrics) {
        expect(metric.platform).toBe('google_ads');
      }
    });
  });

  test.describe('OPTIMISE Tools', () => {
    test('update_media_buy - should apply set_status updates with structured result', async ({ request }) => {
      const pauseResponse = await request.post(`${API_BASE}/api/tools/update_media_buy`, {
        data: {
          media_buy_id: 'mb_apex_motors_q1',
          updates: {
            set_status: { status: 'paused' },
          },
        },
      });

      expect(pauseResponse.status()).toBe(200);
      const pauseData = await pauseResponse.json();
      expect(pauseData.success).toBe(true);
      expect(pauseData.result).toBeDefined();
      expect(pauseData.result.success).toBe(true);
      expect(Array.isArray(pauseData.result.changes_applied)).toBe(true);
      expect(pauseData.result.changes_applied.length).toBeGreaterThan(0);
      expect(pauseData.result.changes_applied[0].operation).toBe('set_status');

      // Cleanup to avoid persistent side-effects for manual demos.
      const resumeResponse = await request.post(`${API_BASE}/api/tools/update_media_buy`, {
        data: {
          media_buy_id: 'mb_apex_motors_q1',
          updates: {
            set_status: { status: 'active' },
          },
        },
      });
      expect(resumeResponse.status()).toBe(200);
      const resumeData = await resumeResponse.json();
      expect(resumeData.success).toBe(true);
      expect(resumeData.result.success).toBe(true);
    });

    test('provide_performance_feedback - should accept valid feedback', async ({ request }) => {
      const response = await request.post(`${API_BASE}/api/tools/provide_performance_feedback`, {
        data: {
          media_buy_id: 'mb_apex_motors_q1',
          feedback_type: 'conversion_data',
          data: { conversions: 100, conversion_value: 100000 },
        },
      });

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.result).toBeDefined();
      expect(data.result.feedback_id).toContain('fb_mb_apex_motors_q1_conversion');
      expect(data.result.status).toBe('processed');
      expect(data.result.impact).toBeTruthy();
    });
  });

  test.describe('CREATE Tools', () => {
    test('create_media_buy - should validate required fields', async ({ request }) => {
      const response = await request.post(`${API_BASE}/api/tools/create_media_buy`, {
        data: {
          name: 'Test Campaign',
          budget: 10000,
        },
      });

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toContain('Missing required fields');
    });

    test('create_media_buy - should create and then retrieve metrics for new media buy', async ({
      request,
    }) => {
      const createResponse = await request.post(`${API_BASE}/api/tools/create_media_buy`, {
        data: {
          brand_name: 'Test Brand',
          product_id: 'prod_fb_news_feed',
          budget: 10000,
          targeting: {
            geo_country_any_of: ['US'],
            device_type: ['mobile'],
          },
          start_time: '2026-02-01T00:00:00Z',
          end_time: '2026-02-28T23:59:59Z',
        },
      });

      expect(createResponse.status()).toBe(200);
      const createData = await createResponse.json();
      expect(createData.success).toBe(true);
      expect(createData.media_buy).toBeDefined();
      expect(createData.media_buy.media_buy_id).toContain('mb_test_brand_');
      expect(createData.media_buy.status).toBe('submitted');
      expect(createData.media_buy.estimated_impressions).toBeGreaterThan(0);

      const createdMediaBuyId = createData.media_buy.media_buy_id as string;
      const deliveryResponse = await request.post(`${API_BASE}/api/tools/get_media_buy_delivery`, {
        data: { media_buy_id: createdMediaBuyId },
      });

      expect(deliveryResponse.status()).toBe(200);
      const deliveryData = await deliveryResponse.json();
      expect(deliveryData.success).toBe(true);
      expect(deliveryData.metrics).toBeDefined();
      expect(deliveryData.metrics.media_buy_id).toBe(createdMediaBuyId);
      expect(deliveryData.metrics.total_budget).toBe(10000);
    });
  });
});

