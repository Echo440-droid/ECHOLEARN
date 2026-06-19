// ─── EchoLearn Backend — Entry Point ────────────
// Express HTTP server + WebSocket server.
// HTTP: health check + future REST endpoints.
// WS: real-time tutoring pipeline.

import 'dotenv/config';
import { warmUpDatabase, startKeepAlive } from './lib/prisma';
import http from 'http';
import express from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import { handleConnection } from './ws/connection.handler';
import apiRouter from './api.routes';

const PORT = parseInt(process.env.PORT || '8080', 10);

// ─── Express App ────────────────────────────────

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// REST API
app.use('/api', apiRouter);

// ─── HTTP Server ────────────────────────────────

const server = http.createServer(app);

// ─── WebSocket Server ───────────────────────────

const wss = new WebSocketServer({ server });
wss.on('connection', handleConnection);

// ─── Start ──────────────────────────────────────

server.listen(PORT, async () => {
  console.log(`EchoLearn backend running on http://localhost:${PORT}`);
  console.log(`WebSocket available at ws://localhost:${PORT}`);

  // Wake the Neon database and start the keep-alive heartbeat
  await warmUpDatabase();
  //redeployment check
  // startKeepAlive();
});
