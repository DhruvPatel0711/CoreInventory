import http from 'http';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { env } from './config/env';
import { connectDB, disconnectDB } from './config/db';
import { initSocket } from './config/socket';
import { errorHandler } from './middleware/error.middleware';
import { ApiError } from './utils/ApiError';
import routes from './routes';

// ─── Create Express App ──────────────────────────────────────
const app = express();

// ─── Global Middleware ───────────────────────────────────────
app.use(helmet());

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api', apiLimiter);

app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Request Logger (development only) ──────────────────────
if (env.NODE_ENV === 'development') {
  app.use((req, _res, next) => {
    console.log(`→  ${req.method} ${req.url}`);
    next();
  });
}

// ─── API Routes ──────────────────────────────────────────────
app.use('/api', routes);

// ─── 404 Handler ─────────────────────────────────────────────
app.use((_req, _res, next) => {
  next(new ApiError(404, 'Route not found'));
});

// ─── Global Error Handler ────────────────────────────────────
app.use(errorHandler);

// ─── HTTP + Socket.io Server ─────────────────────────────────
const httpServer = http.createServer(app);
const io = initSocket(httpServer);

// ─── Start ───────────────────────────────────────────────────
const start = async (): Promise<void> => {
  // 1. Connect to MongoDB
  await connectDB();

  // 2. Start listening
  httpServer.listen(env.PORT, () => {
    console.log(`
┌──────────────────────────────────────────────┐
│                                              │
│   🚀  CoreInventory API                      │
│                                              │
│   Environment : ${env.NODE_ENV.padEnd(28)}│
│   Port        : ${String(env.PORT).padEnd(28)}│
│   MongoDB     : connected                    │
│   Socket.io   : ready                        │
│                                              │
│   Health      : http://localhost:${env.PORT}/api/health  │
│   Products    : http://localhost:${env.PORT}/api/products │
│                                              │
└──────────────────────────────────────────────┘
    `);
  });
};

// ─── Graceful Shutdown ───────────────────────────────────────
const shutdown = async (signal: string) => {
  console.log(`\n${signal} received — shutting down gracefully…`);
  io.close();
  httpServer.close();
  await disconnectDB();
  process.exit(0);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// ─── Unhandled Errors ────────────────────────────────────────
process.on('unhandledRejection', (reason: Error) => {
  console.error('UNHANDLED REJECTION:', reason);
  shutdown('unhandledRejection');
});

process.on('uncaughtException', (error: Error) => {
  console.error('UNCAUGHT EXCEPTION:', error);
  shutdown('uncaughtException');
});

// ─── Go! ─────────────────────────────────────────────────────
start();

export { app, httpServer };
