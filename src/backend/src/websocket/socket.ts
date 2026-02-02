import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { getFullState } from '../data/loader.js';
import type { MediaBuy, DeliveryMetrics, PerformanceFeedback } from '../types/data.js';
import type { NotificationResult } from '../services/notificationService.js';

/**
 * WebSocket event types for the AdCP demo
 */
export interface ServerToClientEvents {
  initial_state: (data: ReturnType<typeof getFullState>) => void;
  media_buy_updated: (data: MediaBuyUpdatedPayload) => void;
  media_buy_created: (data: MediaBuyCreatedPayload) => void;
  feedback_submitted: (data: FeedbackSubmittedPayload) => void;
}

export interface ClientToServerEvents {
  request_state: () => void;
}

export interface MediaBuyUpdatedPayload {
  media_buy_id: string;
  media_buy: MediaBuy;
  delivery_metrics: DeliveryMetrics | null;
  changes_applied: Array<{
    operation: string;
    details: string;
    previous_value?: string | number | string[];
    new_value?: string | number | string[];
  }>;
  timestamp: string;
  notifications?: NotificationResult;
}

export interface MediaBuyCreatedPayload {
  media_buy_id: string;
  media_buy: MediaBuy;
  delivery_metrics: DeliveryMetrics;
  estimated_impressions: number;
  timestamp: string;
}

export interface FeedbackSubmittedPayload {
  feedback_id: string;
  media_buy_id: string;
  feedback_type: 'conversion_data' | 'lead_quality' | 'brand_lift';
  impact: string;
  timestamp: string;
}

let io: Server<ClientToServerEvents, ServerToClientEvents> | null = null;

/**
 * Initialize the Socket.io server
 */
export function initializeWebSocket(httpServer: HttpServer): Server<ClientToServerEvents, ServerToClientEvents> {
  io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
    cors: {
      // Allow connections from dev (localhost) and hosted environments (e.g. Replit).
      // Express uses `origin: true` in `src/index.ts`; this mirrors that behavior.
      origin: (_origin, callback) => callback(null, true),
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  io.on('connection', (socket: Socket<ClientToServerEvents, ServerToClientEvents>) => {
    console.log(`Client connected: ${socket.id}`);

    // Send initial state on connection
    const fullState = getFullState();
    socket.emit('initial_state', fullState);

    // Handle client requesting state refresh
    socket.on('request_state', () => {
      const state = getFullState();
      socket.emit('initial_state', state);
    });

    socket.on('disconnect', (reason) => {
      console.log(`Client disconnected: ${socket.id}, reason: ${reason}`);
    });
  });

  console.log('WebSocket server initialized');
  return io;
}

/**
 * Get the Socket.io server instance
 */
export function getIO(): Server<ClientToServerEvents, ServerToClientEvents> | null {
  return io;
}

/**
 * Broadcast media_buy_updated event to all connected clients
 */
export function broadcastMediaBuyUpdated(payload: MediaBuyUpdatedPayload): void {
  if (io) {
    io.emit('media_buy_updated', payload);
    console.log(`Broadcasted media_buy_updated for ${payload.media_buy_id}`);
  }
}

/**
 * Broadcast media_buy_created event to all connected clients
 */
export function broadcastMediaBuyCreated(payload: MediaBuyCreatedPayload): void {
  if (io) {
    io.emit('media_buy_created', payload);
    console.log(`Broadcasted media_buy_created for ${payload.media_buy_id}`);
  }
}

/**
 * Broadcast feedback_submitted event to all connected clients
 */
export function broadcastFeedbackSubmitted(payload: FeedbackSubmittedPayload): void {
  if (io) {
    io.emit('feedback_submitted', payload);
    console.log(`Broadcasted feedback_submitted for ${payload.feedback_id}`);
  }
}
