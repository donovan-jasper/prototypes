import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

import workflowRoutes from './routes/workflows.js';
import providerRoutes from './routes/providers.js';
import telephonyRoutes from './routes/telephony.js';
import { setupWebSocket } from './websocket.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Routes
app.use('/api/workflows', workflowRoutes);
app.use('/api/providers', providerRoutes);
app.use('/api/telephony', telephonyRoutes);

// Serve index.html for all other routes (SPA fallback)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

// Create HTTP server
const server = http.createServer(app);

// Setup WebSocket server
setupWebSocket(server);

// Start the server
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`WebSocket server running on ws://localhost:${PORT}/ws`);
});
