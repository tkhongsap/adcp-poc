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

### Notification Configuration (Secrets)
- `SLACK_WEBHOOK_URL`: Slack Incoming Webhook URL for posting notifications
- `RESEND_API_KEY`: Resend API key for sending emails

### Notification Configuration (Environment Variables)
- `SLACK_CHANNEL_NAME`: Display name for Slack channel (e.g., `#adcp-demo`)
- `EMAIL_FROM`: Sender email address (use `onboarding@resend.dev` for sandbox, or verify your domain in Resend)
- `DEMO_EMAIL_RECIPIENT`: Email address to receive demo notifications

## Key Features
- Chat interface with streaming responses
- Real-time dashboard with WebSocket updates
- Artifact panel for visualizing tool results
- Dark/light theme toggle
- **Notification Agents**: Automated Slack and email notifications on campaign changes
  - Slack: Posts to configured channel when `update_media_buy` is called
  - Email: Generates draft emails, sends on user confirmation via Resend API
  - Campaign Details Panel: Shows live updates with highlight animations

## Testing
- **Test Framework**: Playwright for E2E and API testing
- **Test Commands**:
  - `npm run test` - Run all tests
  - `npm run test:api` - Run API endpoint tests only
  - `npm run test:tools` - Run AdCP tools integration tests
  - `npm run test:chat` - Run chat page UI tests
  - `npm run test:dashboard` - Run dashboard page UI tests
  - `npm run test:report` - View HTML test report

### Test Coverage
- **API Tests** (`tests/api.spec.ts`): 12 tests covering /api/tools, /api/chat, /api/notifications endpoints
- **Tools Integration Tests** (`tests/tools.spec.ts`): 12 tests covering all 7 AdCP tools (get_products, list_creative_formats, list_authorized_properties, get_media_buy_delivery, update_media_buy, create_media_buy, provide_performance_feedback)
- **Chat UI Tests** (`tests/chat.spec.ts`): Tests for chat page elements and navigation
- **Dashboard UI Tests** (`tests/dashboard.spec.ts`): Tests for dashboard elements and real-time features

### Environment Limitations
Browser-based E2E tests (chat, dashboard) may not run in sandboxed environments due to browser launch restrictions. API tests work reliably in all environments.

## Recent Changes
- February 5, 2026: Added end-to-end testing with Playwright
  - Created comprehensive API tests for all backend endpoints
  - Added AdCP tools integration tests with schema validation
  - Created UI tests for chat and dashboard pages
  - Added test scripts to package.json for easy execution
- February 2, 2026: Added notification agents
  - Configured Slack webhook integration for `#adcp-demo` channel
  - Configured Resend email integration with sandbox domain
  - Tested end-to-end notification flow: chat → Slack → email
- February 1, 2026: Fixed React performance issues
  - Fixed infinite re-render loop in MainContainer.tsx caused by unstable function references in useEffect dependencies
  - Added refs for callback functions to prevent dependency array triggers
  - Added debouncing (1 second) to conversation saves to reduce backend load
  - Added stale state guards to prevent overwriting conversations during rapid switching
  - Added proper cleanup for timers on component unmount
  - Added downlevelIteration to tsconfig.json for TypeScript build compatibility
- January 31, 2026: Configured for Replit environment
  - Set frontend to run on port 5000 with host 0.0.0.0
  - Enabled CORS for all origins on backend
  - Added Next.js configuration for allowed dev origins
