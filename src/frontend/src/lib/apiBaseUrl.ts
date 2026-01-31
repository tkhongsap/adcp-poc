/**
 * Shared API base URL for talking to the backend from the browser.
 *
 * In Replit, this MUST point to the backend port (3001), e.g.
 * `https://<your-replit-domain>:3001`.
 */
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

