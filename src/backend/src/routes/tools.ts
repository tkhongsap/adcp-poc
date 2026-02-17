import { Router, Request, Response } from 'express';
import {
  getProducts,
  listCreativeFormats,
  listAuthorizedProperties,
  createMediaBuy,
  getMediaBuyDelivery,
  updateMediaBuy,
  providePerformanceFeedback,
} from '../tools/index.js';

const router = Router();

/**
 * Tool name to handler mapping
 */
type ToolHandler = (input: unknown) => unknown | Promise<unknown>;

const toolHandlers: Record<string, ToolHandler> = {
  get_products: getProducts as ToolHandler,
  list_creative_formats: listCreativeFormats as ToolHandler,
  list_authorized_properties: listAuthorizedProperties as ToolHandler,
  create_media_buy: createMediaBuy as ToolHandler,
  get_media_buy_delivery: getMediaBuyDelivery as ToolHandler,
  update_media_buy: updateMediaBuy as ToolHandler,
  provide_performance_feedback: providePerformanceFeedback as ToolHandler,
};

interface ToolExecutionErrorPayload {
  success: false;
  error: string;
  error_code: 'tool_not_found' | 'tool_execution_failed';
  tool: string;
  available_tools?: string[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

/**
 * Backward-compatible input normalization:
 * - Preferred payload is direct tool input object.
 * - If body is wrapped as { data: {...} }, unwrap it.
 */
function normalizeToolInput(body: unknown): unknown {
  if (isRecord(body) && Object.keys(body).length === 1 && 'data' in body) {
    return body.data;
  }
  return body;
}

function sendToolError(
  res: Response,
  status: number,
  payload: ToolExecutionErrorPayload
): void {
  res.status(status).json(payload);
}

/**
 * Get list of available tools
 */
router.get('/', (_req: Request, res: Response) => {
  res.json({
    success: true,
    tools: Object.keys(toolHandlers),
  });
});

/**
 * POST /api/tools/:toolName
 *
 * Execute a tool with the provided input parameters.
 * Request body is passed as the input to the tool.
 */
router.post('/:toolName', async (req: Request, res: Response) => {
  const { toolName } = req.params;

  // Check if tool exists
  const handler = toolHandlers[toolName];
  if (!handler) {
    sendToolError(res, 404, {
      success: false,
      error: `Tool not found: ${toolName}`,
      error_code: 'tool_not_found',
      tool: toolName,
      available_tools: Object.keys(toolHandlers),
    });
    return;
  }

  try {
    // Execute the tool with normalized request body as input
    const input = normalizeToolInput(req.body);
    const result = await handler(input);

    res.json(result);
  } catch (error) {
    // Handle unexpected errors
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    sendToolError(res, 500, {
      success: false,
      error: `Tool execution failed: ${errorMessage}`,
      error_code: 'tool_execution_failed',
      tool: toolName,
    });
  }
});

export default router;
