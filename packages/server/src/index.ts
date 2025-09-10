import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import { config } from './config.js';
import { setupSocketHandlers } from './socket/handlers.js';
import { authRouter } from './routes/auth.js';
import { deviceRouter } from './routes/devices.js';

const app = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: config.CORS_ORIGIN,
    credentials: true
  },
  transports: ['websocket', 'polling']
});

app.use(cors({
  origin: config.CORS_ORIGIN,
  credentials: true
}));
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/devices', deviceRouter);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

setupSocketHandlers(io);

httpServer.listen(config.PORT, () => {
  console.log(`Tivi signaling server running on port ${config.PORT}`);
});