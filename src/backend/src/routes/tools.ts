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
type ToolHandler = (input: unknown) => unknown;

const toolHandlers: Record<string, ToolHandler> = {
  get_products: getProducts as ToolHandler,
  list_creative_formats: listCreativeFormats as ToolHandler,
  list_authorized_properties: listAuthorizedProperties as ToolHandler,
  create_media_buy: createMediaBuy as ToolHandler,
  get_media_buy_delivery: getMediaBuyDelivery as ToolHandler,
  update_media_buy: updateMediaBuy as ToolHandler,
  provide_performance_feedback: providePerformanceFeedback as ToolHandler,
};

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
router.post('/:toolName', (req: Request, res: Response) => {
  const { toolName } = req.params;

  // Check if tool exists
  const handler = toolHandlers[toolName];
  if (!handler) {
    res.status(404).json({
      success: false,
      error: `Tool not found: ${toolName}`,
      available_tools: Object.keys(toolHandlers),
    });
    return;
  }

  try {
    // Execute the tool with the request body as input
    const input = req.body;
    const result = handler(input);

    res.json(result);
  } catch (error) {
    // Handle unexpected errors
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({
      success: false,
      error: `Tool execution failed: ${errorMessage}`,
    });
  }
});

export default router;
