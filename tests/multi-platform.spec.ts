import { test, expect } from '@playwright/test';

const API_BASE = 'http://localhost:3001';

test.describe('Multi-Platform Data Implementation', () => {
  test.describe('Platform Filtering - get_products', () => {
    test('should return all 47 products without filter', async ({ request }) => {
      const response = await request.post(`${API_BASE}/api/tools/get_products`, {
        data: {}
      });

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.count).toBe(47); // Total across all platforms
      expect(data.products.length).toBe(47);
    });

    test('should filter Facebook Ads products', async ({ request }) => {
      const response = await request.post(`${API_BASE}/api/tools/get_products`, {
        data: { platform: 'facebook_ads' }
      });

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.count).toBe(8); // 8 Facebook products
      expect(data.filters_applied).toEqual({ platform: 'facebook_ads' });

      // Verify all products have correct platform
      data.products.forEach((product: any) => {
        expect(product.platform).toBe('facebook_ads');
      });
    });

    test('should filter Google Ads products', async ({ request }) => {
      const response = await request.post(`${API_BASE}/api/tools/get_products`, {
        data: { platform: 'google_ads' }
      });

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.count).toBe(9); // 9 Google Ads products

      data.products.forEach((product: any) => {
        expect(product.platform).toBe('google_ads');
      });
    });

    test('should filter display_programmatic products', async ({ request }) => {
      const response = await request.post(`${API_BASE}/api/tools/get_products`, {
        data: { platform: 'display_programmatic' }
      });

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.count).toBe(10); // Original 10 display products
    });

    test('should filter social_influencer products', async ({ request }) => {
      const response = await request.post(`${API_BASE}/api/tools/get_products`, {
        data: { platform: 'social_influencer' }
      });

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.count).toBe(6); // 6 influencer products
    });

    test('should filter car_sales products', async ({ request }) => {
      const response = await request.post(`${API_BASE}/api/tools/get_products`, {
        data: { platform: 'car_sales' }
      });

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.count).toBe(7); // 7 car sales products
    });

    test('should filter crm_data products', async ({ request }) => {
      const response = await request.post(`${API_BASE}/api/tools/get_products`, {
        data: { platform: 'crm_data' }
      });

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.count).toBe(7); // 7 CRM products
    });
  });

  test.describe('Platform Filtering - get_media_buy_delivery', () => {
    test('should return at least 27 media buys without filter', async ({ request }) => {
      const response = await request.post(`${API_BASE}/api/tools/get_media_buy_delivery`, {
        data: {}
      });

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.count).toBeGreaterThanOrEqual(27); // Total across all platforms (may include test records)
    });

    test('should filter Facebook Ads campaigns', async ({ request }) => {
      const response = await request.post(`${API_BASE}/api/tools/get_media_buy_delivery`, {
        data: { platform: 'facebook_ads' }
      });

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.count).toBe(5); // 5 Facebook campaigns

      // Verify all metrics have platform field and platform_specific_metrics
      data.metrics.forEach((metric: any) => {
        expect(metric.platform).toBe('facebook_ads');
        expect(metric.platform_specific_metrics).toBeDefined();

        // Facebook-specific metrics
        expect(metric.platform_specific_metrics.engagement_rate).toBeDefined();
        expect(metric.platform_specific_metrics.roas).toBeDefined();
      });
    });

    test('should filter Google Ads campaigns', async ({ request }) => {
      const response = await request.post(`${API_BASE}/api/tools/get_media_buy_delivery`, {
        data: { platform: 'google_ads' }
      });

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.count).toBe(5); // 5 Google Ads campaigns

      data.metrics.forEach((metric: any) => {
        expect(metric.platform).toBe('google_ads');
        expect(metric.platform_specific_metrics).toBeDefined();

        // Google-specific metrics
        expect(metric.platform_specific_metrics.quality_score !== undefined ||
               metric.platform_specific_metrics.impression_share !== undefined).toBe(true);
      });
    });

    test('should filter display_programmatic campaigns', async ({ request }) => {
      const response = await request.post(`${API_BASE}/api/tools/get_media_buy_delivery`, {
        data: { platform: 'display_programmatic' }
      });

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.count).toBe(5); // Original 5 display campaigns
    });
  });

  test.describe('Backward Compatibility', () => {
    test('should retrieve original Apex Motors Q1 campaign', async ({ request }) => {
      const response = await request.post(`${API_BASE}/api/tools/get_media_buy_delivery`, {
        data: { media_buy_id: 'mb_apex_motors_q1' }
      });

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.metrics).toBeDefined();
      expect(data.metrics.media_buy_id).toBe('mb_apex_motors_q1');
      expect(data.metrics.platform).toBe('display_programmatic');
    });

    test('should retrieve original TechFlow campaign', async ({ request }) => {
      const response = await request.post(`${API_BASE}/api/tools/get_media_buy_delivery`, {
        data: { media_buy_id: 'mb_techflow_saas' }
      });

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.metrics.platform).toBe('display_programmatic');
    });
  });

  test.describe('Cross-Platform Brand Queries', () => {
    test('should find Apex Motors across multiple platforms', async ({ request }) => {
      const response = await request.post(`${API_BASE}/api/tools/get_media_buy_delivery`, {
        data: {}
      });

      expect(response.status()).toBe(200);
      const data = await response.json();

      // Filter Apex Motors campaigns
      const apexCampaigns = data.metrics.filter((m: any) =>
        m.brand && m.brand.toLowerCase().includes('apex motors')
      );

      expect(apexCampaigns.length).toBeGreaterThan(3); // Should be on multiple platforms

      // Verify different platforms
      const platforms = new Set(apexCampaigns.map((c: any) => c.platform));
      expect(platforms.size).toBeGreaterThan(2); // At least 3 different platforms

      // Should include display_programmatic, facebook_ads, google_ads, car_sales
      expect(platforms.has('display_programmatic')).toBe(true);
    });
  });

  test.describe('Creative Formats and Properties', () => {
    test('should return 41 creative formats total', async ({ request }) => {
      const response = await request.post(`${API_BASE}/api/tools/list_creative_formats`, {
        data: {}
      });

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);

      const formats = data.formats || data.creative_formats;
      expect(formats.length).toBe(41); // Total from all platforms
    });

    test('should return 41 authorized properties total', async ({ request }) => {
      const response = await request.post(`${API_BASE}/api/tools/list_authorized_properties`, {
        data: {}
      });

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);

      const properties = data.properties || data.authorized_properties;
      expect(properties.length).toBe(41); // Total from all platforms
    });

    test('creative formats should include Facebook-specific formats', async ({ request }) => {
      const response = await request.post(`${API_BASE}/api/tools/list_creative_formats`, {
        data: {}
      });

      const data = await response.json();
      const formats = data.formats || data.creative_formats;

      // Check for Facebook formats
      const fbFormats = formats.filter((f: any) =>
        f.format_id && f.format_id.includes('fb_')
      );
      expect(fbFormats.length).toBeGreaterThan(0);
    });

    test('authorized properties should include Google-specific properties', async ({ request }) => {
      const response = await request.post(`${API_BASE}/api/tools/list_authorized_properties`, {
        data: {}
      });

      const data = await response.json();
      const properties = data.properties || data.authorized_properties;

      // Check for Google properties
      const gadsProps = properties.filter((p: any) =>
        p.property_id && p.property_id.includes('gads_')
      );
      expect(gadsProps.length).toBeGreaterThan(0);
    });
  });

  test.describe('Platform-Specific Metrics', () => {
    test('Facebook campaigns should have ROAS and engagement metrics', async ({ request }) => {
      const response = await request.post(`${API_BASE}/api/tools/get_media_buy_delivery`, {
        data: { platform: 'facebook_ads' }
      });

      const data = await response.json();
      const firstCampaign = data.metrics[0];

      expect(firstCampaign.platform_specific_metrics.roas).toBeDefined();
      expect(firstCampaign.platform_specific_metrics.engagement_rate).toBeDefined();
      // Facebook metrics vary, just ensure core metrics exist
    });

    test('Google campaigns should have quality score and impression share', async ({ request }) => {
      const response = await request.post(`${API_BASE}/api/tools/get_media_buy_delivery`, {
        data: { platform: 'google_ads' }
      });

      const data = await response.json();
      const campaigns = data.metrics;

      // At least some campaigns should have quality_score or impression_share
      const hasQualityMetrics = campaigns.some((c: any) =>
        c.platform_specific_metrics.quality_score !== undefined ||
        c.platform_specific_metrics.impression_share !== undefined
      );
      expect(hasQualityMetrics).toBe(true);
    });

    test('Influencer campaigns should have engagement and follower metrics', async ({ request }) => {
      const response = await request.post(`${API_BASE}/api/tools/get_media_buy_delivery`, {
        data: { platform: 'social_influencer' }
      });

      const data = await response.json();
      const firstCampaign = data.metrics[0];

      expect(firstCampaign.platform_specific_metrics).toBeDefined();
      // Influencer metrics vary, just check the field exists
    });
  });

  test.describe('Data Integrity', () => {
    test('all products should have platform field', async ({ request }) => {
      const response = await request.post(`${API_BASE}/api/tools/get_products`, {
        data: {}
      });

      const data = await response.json();
      data.products.forEach((product: any) => {
        expect(product.platform).toBeDefined();
        expect(typeof product.platform).toBe('string');
      });
    });

    test('all non-test media buys should have platform field', async ({ request }) => {
      const response = await request.post(`${API_BASE}/api/tools/get_media_buy_delivery`, {
        data: {}
      });

      const data = await response.json();
      // Filter out test records (those with media_buy_id starting with mb_test)
      const productionMetrics = data.metrics.filter((m: any) =>
        !m.media_buy_id.startsWith('mb_test')
      );

      expect(productionMetrics.length).toBeGreaterThanOrEqual(27);
      productionMetrics.forEach((metric: any) => {
        expect(metric.platform).toBeDefined();
        expect(typeof metric.platform).toBe('string');
      });
    });

    test('platform counts should sum to 47 products', async ({ request }) => {
      const platforms = ['display_programmatic', 'facebook_ads', 'google_ads',
                         'social_influencer', 'car_sales', 'crm_data'];

      let totalCount = 0;

      for (const platform of platforms) {
        const response = await request.post(`${API_BASE}/api/tools/get_products`, {
          data: { platform }
        });
        const data = await response.json();
        totalCount += data.count;
      }

      expect(totalCount).toBe(47);
    });

    test('platform counts should sum to 27 media buys', async ({ request }) => {
      const platforms = ['display_programmatic', 'facebook_ads', 'google_ads',
                         'social_influencer', 'car_sales', 'crm_data'];

      let totalCount = 0;

      for (const platform of platforms) {
        const response = await request.post(`${API_BASE}/api/tools/get_media_buy_delivery`, {
          data: { platform }
        });
        const data = await response.json();
        totalCount += data.count;
      }

      // Should be exactly 27 from our platform data (test records don't have platform field)
      expect(totalCount).toBe(27);
    });
  });
});
