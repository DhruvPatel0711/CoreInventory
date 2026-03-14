"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIO = exports.initSocket = void 0;
const socket_io_1 = require("socket.io");
const env_1 = require("./env");
let io;
// ─── Initialize Socket.io ────────────────────────────────────
const initSocket = (httpServer) => {
    io = new socket_io_1.Server(httpServer, {
        cors: {
            origin: env_1.env.CLIENT_URL,
            methods: ['GET', 'POST'],
        },
    });
    io.on('connection', (socket) => {
        console.log(`🔗  Socket connected: ${socket.id}`);
        socket.on('disconnect', (reason) => {
            console.log(`🔌  Socket disconnected: ${socket.id} (${reason})`);
        });
    });
    return io;
};
exports.initSocket = initSocket;
// ─── Accessor ────────────────────────────────────────────────
const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized — call initSocket() first');
    }
    return io;
};
exports.getIO = getIO;
//# sourceMappingURL=socket.js.map