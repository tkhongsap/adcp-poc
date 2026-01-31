# AdCP Sales Agent Demo

## Overview
This is a Claude.ai-style chat interface with artifacts and a live dashboard for an advertising campaign platform (AdCP) sales demo. The application features a two-window design with real-time WebSocket updates.

## Project Structure
- **Frontend**: Next.js 14 application with React 18, Tailwind CSS, Framer Motion
  - Located in `src/frontend/`
  - Runs on port 5000
- **Backend**: Express.js + Socket.IO server with TypeScript
  - Located in `src/backend/`
  - Runs on port 3001

## Tech Stack
- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS, Framer Motion, Socket.IO Client
- **Backend**: Express.js, Socket.IO, TypeScript, Anthropic SDK

## Development
- Frontend dev server: `npm run dev:frontend` (port 5000)
- Backend dev server: `npm run dev:backend` (port 3001)
- Both together: `npm run dev`

## Environment Variables
- `NEXT_PUBLIC_API_URL`: Backend API URL for frontend to connect to (in Replit this must include `:3001`, e.g. `https://<your-replit-domain>:3001`)
- `BACKEND_PORT`: Port for the backend server (default: 3001)

## Key Features
- Chat interface with streaming responses
- Real-time dashboard with WebSocket updates
- Artifact panel for visualizing tool results
- Dark/light theme toggle

## Recent Changes
- January 31, 2026: Configured for Replit environment
  - Set frontend to run on port 5000 with host 0.0.0.0
  - Enabled CORS for all origins on backend
  - Added Next.js configuration for allowed dev origins
