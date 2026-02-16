import Anthropic from '@anthropic-ai/sdk';
import type { Tool, ContentBlock, MessageParam, ToolUseBlock, ToolResultBlockParam } from '@anthropic-ai/sdk/resources/messages';
import {
  getProducts,
  listCreativeFormats,
  listAuthorizedProperties,
  createMediaBuy,
  getMediaBuyDelivery,
  updateMediaBuy,
  providePerformanceFeedback,
} from '../tools/index.js';

// Initialize the Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Default model to use
const DEFAULT_MODEL = 'claude-sonnet-4-5-20250929';

// Valid Claude 4.5 model IDs
const VALID_MODELS = [
  'claude-sonnet-4-5-20250929',
  'claude-opus-4-5-20251101',
  'claude-haiku-4-5-20251001',
] as const;

type ValidModel = typeof VALID_MODELS[number];

// Validate and return the model ID
function getValidModel(model?: string): ValidModel {
  if (model && VALID_MODELS.includes(model as ValidModel)) {
    return model as ValidModel;
  }
  return DEFAULT_MODEL;
}

// Model display names for system prompt
const MODEL_DISPLAY_NAMES: Record<string, string> = {
  'claude-sonnet-4-5-20250929': 'Claude Sonnet 4.5',
  'claude-opus-4-5-20251101': 'Claude Opus 4.5',
  'claude-haiku-4-5-20251001': 'Claude Haiku 4.5',
};

// System prompt for the Signal42.ai Agent
function getSystemPrompt(model: string): string {
  const modelName = MODEL_DISPLAY_NAMES[model] || 'Claude';

  return `You are the Signal42.ai Campaign Agent, powered by ${modelName}. You are an AI assistant built by Signal42.ai to help advertisers and agencies manage their digital advertising campaigns across multiple platforms.

When asked about who you are or what model you're using, mention that you are powered by ${modelName} (by Anthropic) and built by Signal42.ai.

You have access to the following tools to help users:
- get_products: Discover available advertising inventory across all platforms. Use the optional "platform" parameter to filter by platform (e.g., "facebook_ads", "google_ads", "display_programmatic", "social_influencer", "car_sales", "crm_data")
- list_creative_formats: Get available ad format specifications across all platforms
- list_authorized_properties: Get accessible publisher properties with authorization details across all platforms
- create_media_buy: Launch new advertising campaigns
- get_media_buy_delivery: Get performance metrics for campaigns. Use the optional "platform" parameter to filter by platform when not specifying a media_buy_id
- update_media_buy: Modify existing campaigns (change targeting, adjust bids, pause/resume, etc.)
  - Pause/resume campaigns: "Pause Apex campaign" → update_media_buy with set_status: { status: "paused" }
  - Resume campaigns: "Resume Apex" → update_media_buy with set_status: { status: "active" }
- provide_performance_feedback: Submit conversion data, lead quality, or brand lift feedback

Advertising Platforms (6):
1. Display & Programmatic (display_programmatic) — Traditional display/video advertising across premium publishers (ESPN, CNN, Forbes, NYT, etc.)
2. Facebook Ads (facebook_ads) — Social advertising across Facebook, Instagram, Messenger, and Audience Network
3. Google Ads (google_ads) — Search, Display Network, YouTube, Shopping, and Performance Max campaigns
4. Social Influencer (social_influencer) — Influencer marketing across TikTok, Instagram, YouTube, Twitch, etc.
5. Car Sales & Dealership (car_sales) — Automotive advertising on AutoTrader, Cars.com, CarGurus, Edmunds, KBB
6. CRM & Customer Data (crm_data) — Customer lifecycle campaigns via email, SMS, push notifications, and loyalty programs

Brand-to-Campaign Mappings (brands may appear on multiple platforms):
- Apex Motors: mb_apex_motors_q1 (display), mb_fb_apex_motors (facebook), mb_gads_apex_motors (google), mb_car_apex_motors (car_sales), mb_car_apex_service (car_sales)
- TechFlow SaaS: mb_techflow_saas (display), mb_gads_techflow (google), mb_crm_techflow (crm)
- SportMax Apparel: mb_sportmax_apparel (display), mb_fb_sportmax (facebook), mb_inf_sportmax (influencer), mb_inf_sportmax_ugc (influencer)
- FinanceFirst Bank: mb_financefirst (display), mb_gads_financefirst (google), mb_crm_financefirst (crm)
- GreenEnergy Co: mb_greenenergy (display), mb_fb_greenenergy (facebook), mb_car_greenenergy_ev (car_sales)
- LuxeBeauty: mb_fb_luxebeauty (facebook), mb_inf_luxebeauty (influencer), mb_crm_luxebeauty (crm)
- FreshBite Foods: mb_fb_freshbite (facebook), mb_gads_freshbite (google), mb_inf_freshbite (influencer)
- UrbanLiving Real Estate: mb_gads_urbanliving (google), mb_car_urbanliving_partner (car_sales), mb_crm_urbanliving (crm)

Cross-Platform Analysis:
- When a user asks about a brand's performance, check ALL platforms where that brand has campaigns
- Use the platform filter on get_products and get_media_buy_delivery to compare performance across channels
- For questions like "How is Apex Motors performing?", retrieve delivery metrics from display_programmatic, facebook_ads, google_ads, AND car_sales
- For portfolio-level questions ("total spend", "best ROI"), aggregate across all platforms

CRM Correlation:
- CRM campaigns (crm_data) track customer lifecycle outcomes: email open rates, conversion rates, customer lifetime value
- CRM data can be correlated with advertising platforms via brand name (e.g., FinanceFirst CRM outcomes linked to their Google Ads campaigns)
- When asked about attribution or business outcomes, cross-reference CRM metrics with advertising platform data

Guidelines:
- Be helpful and professional
- Use tools to fetch real data rather than making up numbers
- When showing tabular data, format it clearly
- For simple confirmations or single values, respond inline
- For complex data (tables, reports), structure your response clearly
- Always explain what actions you're taking and their results
- When comparing across platforms, present data in a clear comparison format

Smart Defaults:
- When creating campaigns without all details, suggest reasonable defaults based on the product and budget
- For bid adjustments, always confirm the change before and after values
- For geo changes, confirm which countries are being added/removed`;
}

// Tool definitions for Claude API
export const TOOL_DEFINITIONS: Tool[] = [
  {
    name: 'get_products',
    description: 'Discover available advertising inventory with optional filtering by category, maximum CPM, or platform. Returns products with pricing options.',
    input_schema: {
      type: 'object' as const,
      properties: {
        category: {
          type: 'string',
          description: 'Filter products by category (e.g., "display", "video", "native", "audio", "Sports", "News")',
        },
        max_cpm: {
          type: 'number',
          description: 'Maximum CPM (cost per thousand impressions) to filter products',
        },
        platform: {
          type: 'string',
          description: 'Filter products by advertising platform (e.g., "facebook_ads", "google_ads", "display_programmatic", "social_influencer", "car_sales", "crm_data")',
        },
      },
      required: [],
    },
  },
  {
    name: 'list_creative_formats',
    description: 'Get available ad format specifications with optional filtering by type.',
    input_schema: {
      type: 'object' as const,
      properties: {
        type: {
          type: 'string',
          enum: ['display', 'video', 'native', 'audio'],
          description: 'Filter formats by type',
        },
      },
      required: [],
    },
  },
  {
    name: 'list_authorized_properties',
    description: 'Get all accessible publisher properties with authorization levels and available formats.',
    input_schema: {
      type: 'object' as const,
      properties: {},
      required: [],
    },
  },
  {
    name: 'create_media_buy',
    description: 'Create a new advertising campaign (media buy). Requires brand name, product, budget, targeting, and date range.',
    input_schema: {
      type: 'object' as const,
      properties: {
        brand_name: {
          type: 'string',
          description: 'Name of the brand/advertiser',
        },
        product_id: {
          type: 'string',
          description: 'ID of the product to use (from get_products)',
        },
        budget: {
          type: 'number',
          description: 'Total budget for the campaign in USD',
        },
        targeting: {
          type: 'object',
          description: 'Targeting overlay with geo, device, and audience parameters',
          properties: {
            geo_country_any_of: {
              type: 'array',
              items: { type: 'string' },
              description: 'List of country codes to target (e.g., ["US", "UK", "DE"])',
            },
            device_type: {
              type: 'array',
              items: { type: 'string' },
              description: 'Device types to target (e.g., ["desktop", "mobile", "tablet"])',
            },
            sports_interest: {
              type: 'array',
              items: { type: 'string' },
              description: 'Sports interests to target',
            },
          },
        },
        start_time: {
          type: 'string',
          description: 'Campaign start date in ISO 8601 format',
        },
        end_time: {
          type: 'string',
          description: 'Campaign end date in ISO 8601 format',
        },
      },
      required: ['brand_name', 'product_id', 'budget', 'targeting', 'start_time', 'end_time'],
    },
  },
  {
    name: 'get_media_buy_delivery',
    description: 'Get delivery/performance metrics for campaigns. Returns budget, spend, pacing, health status, and detailed metrics. Can filter by platform.',
    input_schema: {
      type: 'object' as const,
      properties: {
        media_buy_id: {
          type: 'string',
          description: 'Specific media buy ID to get metrics for. If omitted, returns all campaigns.',
        },
        platform: {
          type: 'string',
          description: 'Filter delivery metrics by advertising platform (e.g., "facebook_ads", "google_ads", "display_programmatic", "social_influencer", "car_sales", "crm_data"). Only used when media_buy_id is not specified.',
        },
      },
      required: [],
    },
  },
  {
    name: 'update_media_buy',
    description: 'Update an existing campaign with various operations: pause/resume campaign, remove/add geo targeting, adjust bids, set daily caps, or shift budget allocation.',
    input_schema: {
      type: 'object' as const,
      properties: {
        media_buy_id: {
          type: 'string',
          description: 'ID of the media buy to update',
        },
        updates: {
          type: 'object',
          description: 'Update operations to apply',
          properties: {
            remove_geo: {
              type: 'object',
              properties: {
                countries: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Country codes to remove from targeting',
                },
              },
              required: ['countries'],
            },
            add_geo: {
              type: 'object',
              properties: {
                countries: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Country codes to add to targeting',
                },
              },
              required: ['countries'],
            },
            adjust_bid: {
              type: 'object',
              properties: {
                device: {
                  type: 'string',
                  description: 'Device type to adjust bid for',
                },
                change_percent: {
                  type: 'number',
                  description: 'Percentage to change bid (positive to increase, negative to decrease)',
                },
              },
              required: ['device', 'change_percent'],
            },
            set_daily_cap: {
              type: 'object',
              properties: {
                amount: {
                  type: 'number',
                  description: 'Daily budget cap in USD',
                },
              },
              required: ['amount'],
            },
            shift_budget: {
              type: 'object',
              properties: {
                from_device: {
                  type: 'string',
                  description: 'Device to shift budget from',
                },
                to_device: {
                  type: 'string',
                  description: 'Device to shift budget to',
                },
                from_audience: {
                  type: 'string',
                  description: 'Audience segment to shift from',
                },
                to_audience: {
                  type: 'string',
                  description: 'Audience segment to shift to',
                },
                percent: {
                  type: 'number',
                  description: 'Percentage of budget to shift',
                },
              },
              required: ['percent'],
            },
            set_status: {
              type: 'object',
              properties: {
                status: {
                  type: 'string',
                  enum: ['active', 'paused'],
                  description: 'New status for the campaign. Use "paused" to stop/pause a campaign, "active" to resume/start it.',
                },
              },
              required: ['status'],
            },
          },
        },
      },
      required: ['media_buy_id', 'updates'],
    },
  },
  {
    name: 'provide_performance_feedback',
    description: 'Submit performance feedback for a campaign: conversion data, lead quality, or brand lift metrics.',
    input_schema: {
      type: 'object' as const,
      properties: {
        media_buy_id: {
          type: 'string',
          description: 'ID of the media buy to provide feedback for',
        },
        feedback_type: {
          type: 'string',
          enum: ['conversion_data', 'lead_quality', 'brand_lift'],
          description: 'Type of feedback being submitted',
        },
        data: {
          type: 'object',
          description: 'Feedback data based on type',
          properties: {
            conversions: { type: 'number', description: 'Number of conversions (for conversion_data)' },
            conversion_value: { type: 'number', description: 'Total value of conversions (for conversion_data)' },
            attribution_window: { type: 'string', description: 'Attribution window (for conversion_data)' },
            leads_submitted: { type: 'number', description: 'Number of leads submitted (for lead_quality)' },
            leads_qualified: { type: 'number', description: 'Number of qualified leads (for lead_quality)' },
            pipeline_value: { type: 'number', description: 'Pipeline value (for lead_quality)' },
            awareness_lift: { type: 'number', description: 'Awareness lift percentage (for brand_lift)' },
            consideration_lift: { type: 'number', description: 'Consideration lift percentage (for brand_lift)' },
            purchase_intent_lift: { type: 'number', description: 'Purchase intent lift percentage (for brand_lift)' },
            sample_size: { type: 'number', description: 'Sample size for study (for brand_lift)' },
          },
        },
      },
      required: ['media_buy_id', 'feedback_type', 'data'],
    },
  },
];

// Tool execution function (async to support tools like updateMediaBuy that send notifications)
async function executeTool(toolName: string, toolInput: Record<string, unknown>): Promise<unknown> {
  switch (toolName) {
    case 'get_products':
      return getProducts(toolInput as { category?: string; max_cpm?: number; platform?: string });
    case 'list_creative_formats':
      return listCreativeFormats(toolInput as { type?: 'display' | 'video' | 'native' | 'audio' });
    case 'list_authorized_properties':
      return listAuthorizedProperties();
    case 'create_media_buy':
      return createMediaBuy(toolInput as unknown as Parameters<typeof createMediaBuy>[0]);
    case 'get_media_buy_delivery':
      return getMediaBuyDelivery(toolInput as { media_buy_id?: string; platform?: string });
    case 'update_media_buy':
      // updateMediaBuy is async because it sends Slack/Email notifications
      return await updateMediaBuy(toolInput as unknown as Parameters<typeof updateMediaBuy>[0]);
    case 'provide_performance_feedback':
      return providePerformanceFeedback(toolInput as unknown as Parameters<typeof providePerformanceFeedback>[0]);
    default:
      return { error: `Unknown tool: ${toolName}` };
  }
}

// Message history type for conversations
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string | ContentBlock[] | ToolResultBlockParam[];
}

// Response type for chat endpoint
export interface ChatResponse {
  message: string;
  toolCalls?: Array<{
    name: string;
    input: Record<string, unknown>;
    result: unknown;
  }>;
  historyEntries?: ChatMessage[];
}

/**
 * Process a chat message with Claude, handling tool calls
 */
export async function processChat(
  userMessage: string,
  conversationHistory: ChatMessage[] = [],
  model?: string
): Promise<ChatResponse> {
  const validModel = getValidModel(model);

  // Convert our chat history to Claude's format
  const messages: MessageParam[] = conversationHistory.map((msg) => ({
    role: msg.role,
    content: msg.content,
  }));

  // Add the new user message
  messages.push({
    role: 'user',
    content: userMessage,
  });

  const toolCalls: ChatResponse['toolCalls'] = [];

  // Initial API call
  let response = await anthropic.messages.create({
    model: validModel,
    max_tokens: 4096,
    system: getSystemPrompt(validModel),
    tools: TOOL_DEFINITIONS,
    messages,
  });

  // Process tool calls iteratively until we get a final response
  while (response.stop_reason === 'tool_use') {
    // Find all tool use blocks
    const toolUseBlocks = response.content.filter(
      (block): block is ToolUseBlock => block.type === 'tool_use'
    );

    // Execute each tool and collect results
    const toolResults: ToolResultBlockParam[] = [];

    for (const toolUse of toolUseBlocks) {
      const result = await executeTool(toolUse.name, toolUse.input as Record<string, unknown>);

      toolCalls.push({
        name: toolUse.name,
        input: toolUse.input as Record<string, unknown>,
        result,
      });

      toolResults.push({
        type: 'tool_result',
        tool_use_id: toolUse.id,
        content: JSON.stringify(result),
      });
    }

    // Add assistant response with tool use to messages
    messages.push({
      role: 'assistant',
      content: response.content,
    });

    // Add tool results to messages
    messages.push({
      role: 'user',
      content: toolResults,
    });

    // Continue the conversation with tool results
    response = await anthropic.messages.create({
      model: validModel,
      max_tokens: 4096,
      system: getSystemPrompt(validModel),
      tools: TOOL_DEFINITIONS,
      messages,
    });
  }

  // Extract the final text response
  const textBlocks = response.content.filter(
    (block): block is Anthropic.TextBlock => block.type === 'text'
  );
  const finalMessage = textBlocks.map((block) => block.text).join('\n');

  const historyEntries: ChatMessage[] = [];
  const newStartIndex = conversationHistory.length;
  for (let i = newStartIndex; i < messages.length; i++) {
    const msg = messages[i];
    historyEntries.push({ role: msg.role, content: msg.content as string | ContentBlock[] | ToolResultBlockParam[] });
  }
  historyEntries.push({ role: 'assistant', content: response.content });

  return {
    message: finalMessage,
    toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
    historyEntries,
  };
}

/**
 * Process a chat message with streaming support
 */
export async function processChatStream(
  userMessage: string,
  conversationHistory: ChatMessage[] = [],
  onText: (text: string) => void,
  onToolCall?: (name: string, input: Record<string, unknown>) => void,
  onToolResult?: (name: string, result: unknown) => void,
  model?: string
): Promise<ChatResponse> {
  const validModel = getValidModel(model);

  // Convert our chat history to Claude's format
  const messages: MessageParam[] = conversationHistory.map((msg) => ({
    role: msg.role,
    content: msg.content,
  }));

  // Add the new user message
  messages.push({
    role: 'user',
    content: userMessage,
  });

  const toolCalls: ChatResponse['toolCalls'] = [];
  let fullMessage = '';

  // Helper function to process streaming responses
  async function streamResponse(): Promise<Anthropic.Message> {
    const stream = anthropic.messages.stream({
      model: validModel,
      max_tokens: 4096,
      system: getSystemPrompt(validModel),
      tools: TOOL_DEFINITIONS,
      messages,
    });

    // Handle streaming events
    stream.on('text', (text) => {
      fullMessage += text;
      onText(text);
    });

    return stream.finalMessage();
  }

  // Initial streaming call
  let response = await streamResponse();

  // Process tool calls iteratively until we get a final response
  while (response.stop_reason === 'tool_use') {
    // Reset message accumulator for next iteration
    fullMessage = '';

    // Find all tool use blocks
    const toolUseBlocks = response.content.filter(
      (block): block is ToolUseBlock => block.type === 'tool_use'
    );

    // Execute each tool and collect results
    const toolResults: ToolResultBlockParam[] = [];

    for (const toolUse of toolUseBlocks) {
      if (onToolCall) {
        onToolCall(toolUse.name, toolUse.input as Record<string, unknown>);
      }

      const result = await executeTool(toolUse.name, toolUse.input as Record<string, unknown>);

      toolCalls.push({
        name: toolUse.name,
        input: toolUse.input as Record<string, unknown>,
        result,
      });

      if (onToolResult) {
        onToolResult(toolUse.name, result);
      }

      toolResults.push({
        type: 'tool_result',
        tool_use_id: toolUse.id,
        content: JSON.stringify(result),
      });
    }

    // Add assistant response with tool use to messages
    messages.push({
      role: 'assistant',
      content: response.content,
    });

    // Add tool results to messages
    messages.push({
      role: 'user',
      content: toolResults,
    });

    // Continue the conversation with tool results
    response = await streamResponse();
  }

  const historyEntries: ChatMessage[] = [];
  const newStartIndex = conversationHistory.length;
  for (let i = newStartIndex; i < messages.length; i++) {
    const msg = messages[i];
    historyEntries.push({ role: msg.role, content: msg.content as string | ContentBlock[] | ToolResultBlockParam[] });
  }
  historyEntries.push({ role: 'assistant', content: response.content });

  return {
    message: fullMessage,
    toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
    historyEntries,
  };
}

export { anthropic };
