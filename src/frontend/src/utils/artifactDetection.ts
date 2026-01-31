import {
  Artifact,
  ArtifactType,
  TableArtifactData,
  ReportArtifactData,
  TableColumn,
  TableRow,
  ReportSection,
  ReportMetric,
} from "@/types/chat";

/**
 * Tool call data from the chat API
 */
export interface ToolCallData {
  name: string;
  input: Record<string, unknown>;
  result: unknown;
}

/**
 * Detection result for artifact logic
 */
export interface ArtifactDetectionResult {
  shouldShowArtifact: boolean;
  artifact: Artifact | null;
}

/**
 * Keywords/patterns that suggest inline responses (no artifact)
 */
const INLINE_PATTERNS = [
  // Simple confirmations
  /^(paused?|stopped?|removed?|added?|updated?|created?|deleted?)\s/i,
  /\b(confirmed?|done|success)\b/i,
  // Single value queries
  /^what('s| is) the\s+(ctr|cpm|cpa|roas|impressions|clicks|spend|budget)\??$/i,
  /^(how|what) (much|many)\s+/i,
];

/**
 * Tool calls that typically produce table artifacts
 */
const TABLE_PRODUCING_TOOLS = [
  "get_products",
  "list_creative_formats",
  "list_authorized_properties",
];

/**
 * Tool calls that typically produce report artifacts
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const REPORT_PRODUCING_TOOLS = ["get_media_buy_delivery"];

/**
 * Checks if the user message suggests a simple inline response
 */
function isInlineQuery(userMessage: string): boolean {
  return INLINE_PATTERNS.some((pattern) => pattern.test(userMessage.trim()));
}

/**
 * Checks if the result contains multiple items suitable for a table
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function isTableData(result: unknown): result is {
  products?: unknown[];
  formats?: unknown[];
  properties?: unknown[];
  metrics?: unknown[];
  count?: number;
} {
  if (!result || typeof result !== "object") return false;
  const r = result as Record<string, unknown>;

  // Check for array-like results with multiple items
  const hasProducts = Array.isArray(r.products) && r.products.length > 1;
  const hasFormats = Array.isArray(r.formats) && r.formats.length > 1;
  const hasProperties = Array.isArray(r.properties) && r.properties.length > 1;
  const hasMetrics = Array.isArray(r.metrics) && r.metrics.length > 1;

  return hasProducts || hasFormats || hasProperties || hasMetrics;
}

/**
 * Checks if the result is delivery metrics (for report artifact)
 */
function isDeliveryData(result: unknown): result is {
  media_buy_id: string;
  total_budget: number;
  total_spend: number;
  pacing: string;
  health: string;
  summary: string;
  by_device?: unknown;
  by_geo?: unknown;
  recommendations?: string[];
} {
  if (!result || typeof result !== "object") return false;
  const r = result as Record<string, unknown>;

  return (
    typeof r.media_buy_id === "string" &&
    typeof r.total_budget === "number" &&
    typeof r.total_spend === "number" &&
    typeof r.pacing === "string" &&
    typeof r.health === "string"
  );
}

/**
 * Creates a table artifact from product results
 */
function createProductTableArtifact(
  products: unknown[]
): TableArtifactData {
  const columns: TableColumn[] = [
    { key: "name", label: "Product", type: "text" },
    { key: "category", label: "Category", type: "text" },
    { key: "description", label: "Description", type: "text" },
    { key: "cpm_range", label: "CPM Range", type: "text" },
  ];

  const rows: TableRow[] = products.map((p) => {
    const product = p as Record<string, unknown>;
    const pricingOptions = product.pricing_options as
      | Array<{ cpm_min?: number; cpm_max?: number }>
      | undefined;

    let cpmRange = "N/A";
    if (pricingOptions && pricingOptions.length > 0) {
      const minCpm = Math.min(
        ...pricingOptions.map((o) => o.cpm_min || 0)
      );
      const maxCpm = Math.max(
        ...pricingOptions.map((o) => o.cpm_max || 0)
      );
      cpmRange = `$${minCpm.toFixed(2)} - $${maxCpm.toFixed(2)}`;
    }

    return {
      id: product.product_id as string,
      name: product.name as string,
      category: product.category as string,
      description: product.description as string,
      cpm_range: cpmRange,
    };
  });

  return { columns, rows };
}

/**
 * Creates a table artifact from creative format results
 */
function createFormatTableArtifact(
  formats: unknown[]
): TableArtifactData {
  const columns: TableColumn[] = [
    { key: "name", label: "Format", type: "text" },
    { key: "type", label: "Type", type: "text" },
    { key: "dimensions", label: "Dimensions", type: "text" },
  ];

  const rows: TableRow[] = formats.map((f) => {
    const format = f as Record<string, unknown>;
    const specs = format.specs as Record<string, unknown> | undefined;

    let dimensions = "N/A";
    if (specs && specs.dimensions) {
      const dims = specs.dimensions as { width?: number; height?: number };
      dimensions = `${dims.width || 0}x${dims.height || 0}`;
    } else if (specs && specs.duration) {
      dimensions = `${specs.duration}s video`;
    }

    return {
      id: format.format_id as string,
      name: format.name as string,
      type: format.type as string,
      dimensions,
    };
  });

  return { columns, rows };
}

/**
 * Creates a table artifact from property results
 */
function createPropertyTableArtifact(
  properties: unknown[]
): TableArtifactData {
  const columns: TableColumn[] = [
    { key: "name", label: "Publisher", type: "text" },
    { key: "domain", label: "Domain", type: "text" },
    { key: "category", label: "Category", type: "text" },
    { key: "monthly_uniques", label: "Monthly Uniques", type: "number" },
    { key: "authorization_level", label: "Authorization", type: "text" },
  ];

  const rows: TableRow[] = properties.map((p) => {
    const property = p as Record<string, unknown>;
    return {
      id: property.property_id as string,
      name: property.name as string,
      domain: property.domain as string,
      category: property.category as string,
      monthly_uniques: property.monthly_uniques as number,
      authorization_level: property.authorization_level as string,
    };
  });

  return { columns, rows };
}

/**
 * Creates a table artifact from delivery metrics (multiple campaigns)
 */
function createCampaignTableArtifact(
  metrics: unknown[]
): TableArtifactData {
  const columns: TableColumn[] = [
    { key: "media_buy_id", label: "Campaign ID", type: "text" },
    { key: "budget", label: "Budget", type: "currency" },
    { key: "spend", label: "Spend", type: "currency" },
    { key: "pacing", label: "Pacing", type: "pacing" },
    { key: "health", label: "Health", type: "health" },
  ];

  const rows: TableRow[] = metrics.map((m) => {
    const metric = m as Record<string, unknown>;
    const totalBudget = metric.total_budget as number;
    const totalSpend = metric.total_spend as number;
    const pacingPercent = totalBudget > 0 ? (totalSpend / totalBudget) * 100 : 0;

    return {
      id: metric.media_buy_id as string,
      media_buy_id: metric.media_buy_id as string,
      budget: totalBudget,
      spend: totalSpend,
      pacing: { value: pacingPercent, max: 100 },
      health: metric.health as string,
    };
  });

  return { columns, rows };
}

/**
 * Creates a report artifact from single delivery metrics
 */
function createDeliveryReportArtifact(
  data: {
    media_buy_id: string;
    total_budget: number;
    total_spend: number;
    pacing: string;
    health: string;
    summary: string;
    by_device?: unknown;
    by_geo?: unknown;
    recommendations?: string[];
  }
): ReportArtifactData {
  const pacingPercent =
    data.total_budget > 0
      ? ((data.total_spend / data.total_budget) * 100).toFixed(1)
      : "0";

  const overviewMetrics: ReportMetric[] = [
    { label: "Total Budget", value: `$${data.total_budget.toLocaleString()}` },
    { label: "Total Spend", value: `$${data.total_spend.toLocaleString()}` },
    { label: "Pacing", value: `${pacingPercent}%` },
    {
      label: "Health",
      value: data.health,
      changeType:
        data.health === "good"
          ? "positive"
          : data.health === "poor"
          ? "negative"
          : "neutral",
    },
  ];

  const sections: ReportSection[] = [
    { title: "Overview", metrics: overviewMetrics },
  ];

  // Add device breakdown if available
  if (data.by_device && typeof data.by_device === "object") {
    const deviceData = data.by_device as Record<
      string,
      { impressions?: number; clicks?: number; spend?: number }
    >;
    const deviceMetrics: ReportMetric[] = Object.entries(deviceData).map(
      ([device, stats]) => ({
        label: device.charAt(0).toUpperCase() + device.slice(1),
        value: `${((stats.impressions || 0) / 1000).toFixed(1)}K imps`,
      })
    );
    if (deviceMetrics.length > 0) {
      sections.push({ title: "By Device", metrics: deviceMetrics });
    }
  }

  // Add geo breakdown if available
  if (data.by_geo && typeof data.by_geo === "object") {
    const geoData = data.by_geo as Record<
      string,
      { impressions?: number; spend?: number }
    >;
    const geoMetrics: ReportMetric[] = Object.entries(geoData).map(
      ([geo, stats]) => ({
        label: geo,
        value: `$${(stats.spend || 0).toLocaleString()}`,
      })
    );
    if (geoMetrics.length > 0) {
      sections.push({ title: "By Geography", metrics: geoMetrics });
    }
  }

  return {
    icon: "📊",
    sections,
    recommendations: data.recommendations,
    summary: data.summary,
  };
}

/**
 * Detects whether a table or report artifact should be shown
 * based on tool calls and user message
 */
export function detectArtifact(
  toolCalls: ToolCallData[] | undefined,
  userMessage: string
): ArtifactDetectionResult {
  // No tool calls means no artifact
  if (!toolCalls || toolCalls.length === 0) {
    return { shouldShowArtifact: false, artifact: null };
  }

  // Check if this looks like a simple inline query
  // (but we'll still show artifacts for large data sets)
  const isSimpleQuery = isInlineQuery(userMessage);

  // Process each tool call to find artifact-worthy results
  for (const toolCall of toolCalls) {
    const { name, result } = toolCall;

    // Check for update_media_buy - always inline (confirmation)
    if (name === "update_media_buy") {
      continue; // Skip, this is a confirmation
    }

    // Check for provide_performance_feedback - always inline
    if (name === "provide_performance_feedback") {
      continue;
    }

    // Check for create_media_buy - always inline (confirmation)
    if (name === "create_media_buy") {
      continue;
    }

    // Check for table-producing tools
    if (TABLE_PRODUCING_TOOLS.includes(name)) {
      const r = result as Record<string, unknown>;

      // Products table
      if (r.products && Array.isArray(r.products) && r.products.length > 1) {
        const tableData = createProductTableArtifact(r.products);
        return {
          shouldShowArtifact: true,
          artifact: {
            id: `artifact_${Date.now()}`,
            type: "table" as ArtifactType,
            title: "Available Products",
            data: tableData,
            timestamp: new Date(),
          },
        };
      }

      // Formats table
      if (r.formats && Array.isArray(r.formats) && r.formats.length > 1) {
        const tableData = createFormatTableArtifact(r.formats);
        return {
          shouldShowArtifact: true,
          artifact: {
            id: `artifact_${Date.now()}`,
            type: "table" as ArtifactType,
            title: "Creative Formats",
            data: tableData,
            timestamp: new Date(),
          },
        };
      }

      // Properties table
      if (
        r.properties &&
        Array.isArray(r.properties) &&
        r.properties.length > 1
      ) {
        const tableData = createPropertyTableArtifact(r.properties);
        return {
          shouldShowArtifact: true,
          artifact: {
            id: `artifact_${Date.now()}`,
            type: "table" as ArtifactType,
            title: "Authorized Publishers",
            data: tableData,
            timestamp: new Date(),
          },
        };
      }
    }

    // Check for get_media_buy_delivery
    if (name === "get_media_buy_delivery") {
      const r = result as Record<string, unknown>;

      // Multiple campaigns - show as table
      if (r.metrics && Array.isArray(r.metrics) && r.metrics.length > 1) {
        const tableData = createCampaignTableArtifact(r.metrics);
        return {
          shouldShowArtifact: true,
          artifact: {
            id: `artifact_${Date.now()}`,
            type: "table" as ArtifactType,
            title: "Campaign Performance",
            data: tableData,
            timestamp: new Date(),
          },
        };
      }

      // Single campaign - show as report (unless it's a simple query)
      if (isDeliveryData(result) && !isSimpleQuery) {
        const reportData = createDeliveryReportArtifact(result);
        return {
          shouldShowArtifact: true,
          artifact: {
            id: `artifact_${Date.now()}`,
            type: "report" as ArtifactType,
            title: `Performance Report: ${result.media_buy_id}`,
            data: reportData,
            timestamp: new Date(),
          },
        };
      }
    }
  }

  return { shouldShowArtifact: false, artifact: null };
}

/**
 * Determines artifact type based on keywords in user message
 * Used as a fallback when tool calls don't provide clear guidance
 */
export function detectArtifactTypeFromMessage(
  message: string
): ArtifactType | null {
  const lowerMessage = message.toLowerCase();

  // Table keywords
  if (
    /\b(show|list|all|table|compare)\b.*\b(products?|campaigns?|media buys?|formats?|publishers?|properties)\b/i.test(
      lowerMessage
    )
  ) {
    return "table";
  }

  // Report keywords
  if (
    /\b(report|performance|delivery|metrics|analysis|breakdown)\b/i.test(
      lowerMessage
    )
  ) {
    return "report";
  }

  // Comparison keywords -> table
  if (
    /\b(compare|versus|vs\.?|comparison)\b/i.test(lowerMessage)
  ) {
    return "table";
  }

  return null;
}
