import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { loadData, isDataLoaded } from './data/loader.js';
import { initializeWebSocket, getIO } from './websocket/socket.js';

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 3001;

// Load mock data on startup
loadData();

// Initialize WebSocket server
initializeWebSocket(httpServer);

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
}));
app.use(express.json());

// Health check endpoint
app.get('/health', (_req, res) => {
  const io = getIO();
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    dataLoaded: isDataLoaded(),
    websocket: {
      initialized: io !== null,
      connectedClients: io?.engine?.clientsCount ?? 0,
    },
  });
});

// Start server (use httpServer instead of app.listen for Socket.io)
httpServer.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
  console.log(`WebSocket server ready for connections`);
});

export default app;
