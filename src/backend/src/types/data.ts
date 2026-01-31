// TypeScript types for the AdCP demo data schema

export interface PricingOption {
  pricing_option_id: string;
  currency: string;
  cpm: number;
  pricing_model: string;
}

export interface FormatRef {
  agent_url: string;
  id: string;
}

export interface Product {
  product_id: string;
  name: string;
  description: string;
  category: string;
  pricing_options: PricingOption[];
  format_ids: FormatRef[];
  targeting_capabilities: string[];
  minimum_budget: number;
  available_inventory: number;
}

export interface BrandManifest {
  name: string;
  url: string;
}

export interface TargetingOverlay {
  geo_country_any_of?: string[];
  geo_region_any_of?: string[];
  device_type?: string[];
  sports_interest?: string[];
  job_function?: string[];
  income_level?: string;
  age_range?: string;
  [key: string]: string | string[] | undefined;
}

export interface Package {
  package_id: string;
  product_id: string;
  pricing_option_id: string;
  budget: number;
  targeting_overlay: TargetingOverlay;
}

export interface MediaBuy {
  media_buy_id: string;
  buyer_ref: string;
  brand_manifest: BrandManifest;
  packages: Package[];
  start_time: string;
  end_time: string;
  status: 'active' | 'paused' | 'completed' | 'submitted';
  created_at: string;
}

export interface MetricsSummary {
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: number;
  cpm: number;
  cpa: number;
  viewability: number;
  completion_rate: number | null;
}

export interface DeviceMetrics {
  impressions: number;
  clicks: number;
  ctr: number;
  spend: number;
  cpm: number;
}

export interface GeoMetrics {
  impressions: number;
  clicks: number;
  ctr: number;
  spend: number;
}

export interface DeliveryMetrics {
  media_buy_id: string;
  brand: string;
  total_budget: number;
  total_spend: number;
  pacing: 'on_track' | 'behind' | 'overspend';
  health: 'good' | 'warning' | 'poor';
  summary: MetricsSummary;
  by_device: Record<string, DeviceMetrics>;
  by_geo: Record<string, GeoMetrics>;
  current_bids: Record<string, number>;
  recommendations: string[];
}

export interface PortfolioSummary {
  as_of: string;
  total_active_campaigns: number;
  total_budget: number;
  total_spend: number;
  total_remaining: number;
  total_impressions: number;
  total_clicks: number;
  total_conversions: number;
  overall_ctr: number;
  overall_cpm: number;
  overall_cpa: number;
  campaigns_on_track: number;
  campaigns_warning: number;
  campaigns_poor: number;
}

export interface SpendCategory {
  spend: number;
  share: number;
}

export interface PerformingCampaign {
  media_buy_id: string;
  brand: string;
  metric: string;
  value: number;
  reason?: string;
  issue?: string;
}

export interface WeekTrend {
  spend: number;
  impressions: number;
  clicks: number;
  ctr: number;
}

export interface MonthlyTrend {
  week_1: WeekTrend;
  week_2: WeekTrend;
  week_3: WeekTrend;
  week_4: WeekTrend;
}

export interface Aggregations {
  portfolio_summary: PortfolioSummary;
  spend_by_category: Record<string, SpendCategory>;
  spend_by_format: Record<string, SpendCategory>;
  spend_by_device: Record<string, SpendCategory>;
  spend_by_geo: Record<string, SpendCategory>;
  top_performing_campaigns: PerformingCampaign[];
  underperforming_campaigns: PerformingCampaign[];
  monthly_trend: Record<string, MonthlyTrend>;
}

export interface FeedbackData {
  conversions?: number;
  conversion_value?: number;
  attribution_window?: string;
  leads_submitted?: number;
  leads_qualified?: number;
  qualification_rate?: number;
  pipeline_value?: number;
  awareness_lift?: number;
  consideration_lift?: number;
  purchase_intent_lift?: number;
  sample_size?: number;
  lead_to_customer_rate?: number;
  [key: string]: string | number | undefined;
}

export interface PerformanceFeedback {
  feedback_id: string;
  media_buy_id: string;
  submitted_at: string;
  feedback_type: 'conversion_data' | 'lead_quality' | 'brand_lift';
  data: FeedbackData;
  status: 'processed' | 'pending';
  impact: string;
}

export interface CreativeFormatSpecs {
  max_file_size?: string;
  file_types?: string[];
  max_duration?: number;
  skip_after?: number;
  headline_max?: number;
  description_max?: number;
  image_dimensions?: string;
  cta_max?: number;
}

export interface CreativeFormat {
  format_id: string;
  name: string;
  type: 'display' | 'video' | 'native' | 'audio';
  dimensions?: string;
  specs: CreativeFormatSpecs;
}

export interface AdCPData {
  products: Product[];
  media_buys: MediaBuy[];
  delivery_metrics: Record<string, DeliveryMetrics>;
  aggregations: Aggregations;
  performance_feedback_log: PerformanceFeedback[];
}
