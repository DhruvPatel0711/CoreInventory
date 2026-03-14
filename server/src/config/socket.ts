import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { env } from './env';

let io: Server;

// ─── Initialize Socket.io ────────────────────────────────────
export const initSocket = (httpServer: HttpServer): Server => {
  io = new Server(httpServer, {
    cors: {
      origin: env.CLIENT_URL,
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket: Socket) => {
    console.log(`🔗  Socket connected: ${socket.id}`);

    socket.on('disconnect', (reason) => {
      console.log(`🔌  Socket disconnected: ${socket.id} (${reason})`);
    });
  });

  return io;
};

// ─── Accessor ────────────────────────────────────────────────
export const getIO = (): Server => {
  if (!io) {
    throw new Error('Socket.io not initialized — call initSocket() first');
  }
  return io;
};
