import express from 'express';
import cors from 'cors';
import { loadData, isDataLoaded } from './data/loader.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Load mock data on startup
loadData();

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    dataLoaded: isDataLoaded(),
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});

export default app;
