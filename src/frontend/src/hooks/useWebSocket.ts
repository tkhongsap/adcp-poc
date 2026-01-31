"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { io, Socket } from "socket.io-client";

// Mirror the backend types for the dashboard state
export interface MediaBuy {
  media_buy_id: string;
  buyer_ref: string;
  brand_manifest: {
    name: string;
    url: string;
  };
  packages: Array<{
    package_id: string;
    product_id: string;
    pricing_option_id: string;
    budget: number;
    targeting_overlay: {
      geo_country_any_of?: string[];
      geo_region_any_of?: string[];
      device_type?: string[];
      [key: string]: string | string[] | undefined;
    };
  }>;
  start_time: string;
  end_time: string;
  status: "active" | "paused" | "completed" | "submitted";
  created_at: string;
}

export interface DeliveryMetrics {
  media_buy_id: string;
  brand: string;
  total_budget: number;
  total_spend: number;
  pacing: "on_track" | "behind" | "overspend";
  health: "good" | "warning" | "poor";
  summary: {
    impressions: number;
    clicks: number;
    conversions: number;
    ctr: number;
    cpm: number;
    cpa: number;
    viewability: number;
    completion_rate: number | null;
  };
  by_device: Record<
    string,
    {
      impressions: number;
      clicks: number;
      ctr: number;
      spend: number;
      cpm: number;
    }
  >;
  by_geo: Record<
    string,
    {
      impressions: number;
      clicks: number;
      ctr: number;
      spend: number;
    }
  >;
  current_bids: Record<string, number>;
  recommendations: string[];
}

export interface DashboardState {
  mediaBuys: MediaBuy[];
  deliveryMetrics: Record<string, DeliveryMetrics>;
  isConnected: boolean;
  lastUpdated: Date | null;
  recentlyUpdatedIds: Set<string>;
}

interface InitialStatePayload {
  products: unknown[];
  media_buys: MediaBuy[];
  delivery_metrics: Record<string, DeliveryMetrics>;
  aggregations: unknown;
  performance_feedback_log: unknown[];
}

interface MediaBuyUpdatedPayload {
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
}

interface MediaBuyCreatedPayload {
  media_buy_id: string;
  media_buy: MediaBuy;
  delivery_metrics: DeliveryMetrics;
  estimated_impressions: number;
  timestamp: string;
}

interface FeedbackSubmittedPayload {
  feedback_id: string;
  media_buy_id: string;
  feedback_type: "conversion_data" | "lead_quality" | "brand_lift";
  impact: string;
  timestamp: string;
}

const SOCKET_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export function useWebSocket(): DashboardState & {
  requestRefresh: () => void;
} {
  const [mediaBuys, setMediaBuys] = useState<MediaBuy[]>([]);
  const [deliveryMetrics, setDeliveryMetrics] = useState<
    Record<string, DeliveryMetrics>
  >({});
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [recentlyUpdatedIds, setRecentlyUpdatedIds] = useState<Set<string>>(
    new Set()
  );

  const socketRef = useRef<Socket | null>(null);

  // Mark a media buy as recently updated for highlight animation
  const markAsUpdated = useCallback((mediaById: string) => {
    setRecentlyUpdatedIds((prev) => new Set(prev).add(mediaById));

    // Clear the highlight after 400ms (per US-031 animation spec)
    setTimeout(() => {
      setRecentlyUpdatedIds((prev) => {
        const next = new Set(prev);
        next.delete(mediaById);
        return next;
      });
    }, 400);
  }, []);

  // Handle initial state
  const handleInitialState = useCallback((data: InitialStatePayload) => {
    setMediaBuys(data.media_buys);
    setDeliveryMetrics(data.delivery_metrics);
    setLastUpdated(new Date());
  }, []);

  // Handle media buy updated
  const handleMediaBuyUpdated = useCallback(
    (data: MediaBuyUpdatedPayload) => {
      setMediaBuys((prev) =>
        prev.map((mb) =>
          mb.media_buy_id === data.media_buy_id ? data.media_buy : mb
        )
      );

      if (data.delivery_metrics) {
        setDeliveryMetrics((prev) => ({
          ...prev,
          [data.media_buy_id]: data.delivery_metrics!,
        }));
      }

      setLastUpdated(new Date());
      markAsUpdated(data.media_buy_id);
    },
    [markAsUpdated]
  );

  // Handle media buy created
  const handleMediaBuyCreated = useCallback(
    (data: MediaBuyCreatedPayload) => {
      setMediaBuys((prev) => [...prev, data.media_buy]);
      setDeliveryMetrics((prev) => ({
        ...prev,
        [data.media_buy_id]: data.delivery_metrics,
      }));
      setLastUpdated(new Date());
      markAsUpdated(data.media_buy_id);
    },
    [markAsUpdated]
  );

  // Handle feedback submitted (just update timestamp, metrics may change)
  const handleFeedbackSubmitted = useCallback(
    (data: FeedbackSubmittedPayload) => {
      setLastUpdated(new Date());
      markAsUpdated(data.media_buy_id);
    },
    [markAsUpdated]
  );

  // Request state refresh
  const requestRefresh = useCallback(() => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("request_state");
    }
  }, []);

  // Set up socket connection
  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    socketRef.current = socket;

    // Connection events
    socket.on("connect", () => {
      console.log("WebSocket connected");
      setIsConnected(true);
    });

    socket.on("disconnect", (reason) => {
      console.log("WebSocket disconnected:", reason);
      setIsConnected(false);
    });

    socket.on("connect_error", (error) => {
      console.error("WebSocket connection error:", error);
      setIsConnected(false);
    });

    // Data events
    socket.on("initial_state", handleInitialState);
    socket.on("media_buy_updated", handleMediaBuyUpdated);
    socket.on("media_buy_created", handleMediaBuyCreated);
    socket.on("feedback_submitted", handleFeedbackSubmitted);

    // Cleanup on unmount
    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("connect_error");
      socket.off("initial_state");
      socket.off("media_buy_updated");
      socket.off("media_buy_created");
      socket.off("feedback_submitted");
      socket.disconnect();
      socketRef.current = null;
    };
  }, [
    handleInitialState,
    handleMediaBuyUpdated,
    handleMediaBuyCreated,
    handleFeedbackSubmitted,
  ]);

  return {
    mediaBuys,
    deliveryMetrics,
    isConnected,
    lastUpdated,
    recentlyUpdatedIds,
    requestRefresh,
  };
}
