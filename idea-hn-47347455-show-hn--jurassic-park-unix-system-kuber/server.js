const WebSocket = require('ws');
const http = require('http');
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Mock Kubernetes metrics
const generateMetrics = () => {
  return {
    cpu: Math.floor(Math.random() * 101),
    memory: Math.floor(Math.random() * 101),
    disk: Math.floor(Math.random() * 101),
    timestamp: new Date().toISOString()
  };
};

// WebSocket connection handler
wss.on('connection', (ws) => {
  console.log('Client connected');

  // Send initial metrics
  ws.send(JSON.stringify(generateMetrics()));

  // Send periodic updates
  const interval = setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(generateMetrics()));
    }
  }, 1000);

  ws.on('close', () => {
    console.log('Client disconnected');
    clearInterval(interval);
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

// REST API endpoint for metrics
app.get('/api/metrics', (req, res) => {
  res.json(generateMetrics());
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

// Start server
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
