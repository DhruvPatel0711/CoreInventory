"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.httpServer = exports.app = void 0;
const http_1 = __importDefault(require("http"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const env_1 = require("./config/env");
const db_1 = require("./config/db");
const socket_1 = require("./config/socket");
const error_middleware_1 = require("./middleware/error.middleware");
const ApiError_1 = require("./utils/ApiError");
const routes_1 = __importDefault(require("./routes"));
// ─── Create Express App ──────────────────────────────────────
const app = (0, express_1.default)();
exports.app = app;
// ─── Global Middleware ───────────────────────────────────────
app.use((0, cors_1.default)({ origin: env_1.env.CLIENT_URL, credentials: true }));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
// ─── Request Logger (development only) ──────────────────────
if (env_1.env.NODE_ENV === 'development') {
    app.use((req, _res, next) => {
        console.log(`→  ${req.method} ${req.url}`);
        next();
    });
}
// ─── API Routes ──────────────────────────────────────────────
app.use('/api', routes_1.default);
// ─── 404 Handler ─────────────────────────────────────────────
app.use((_req, _res, next) => {
    next(new ApiError_1.ApiError(404, 'Route not found'));
});
// ─── Global Error Handler ────────────────────────────────────
app.use(error_middleware_1.errorHandler);
// ─── HTTP + Socket.io Server ─────────────────────────────────
const httpServer = http_1.default.createServer(app);
exports.httpServer = httpServer;
const io = (0, socket_1.initSocket)(httpServer);
// ─── Start ───────────────────────────────────────────────────
const start = async () => {
    // 1. Connect to MongoDB
    await (0, db_1.connectDB)();
    // 2. Start listening
    httpServer.listen(env_1.env.PORT, () => {
        console.log(`
┌──────────────────────────────────────────────┐
│                                              │
│   🚀  CoreInventory API                      │
│                                              │
│   Environment : ${env_1.env.NODE_ENV.padEnd(28)}│
│   Port        : ${String(env_1.env.PORT).padEnd(28)}│
│   MongoDB     : connected                    │
│   Socket.io   : ready                        │
│                                              │
│   Health      : http://localhost:${env_1.env.PORT}/api/health  │
│   Products    : http://localhost:${env_1.env.PORT}/api/products │
│                                              │
└──────────────────────────────────────────────┘
    `);
    });
};
// ─── Graceful Shutdown ───────────────────────────────────────
const shutdown = async (signal) => {
    console.log(`\n${signal} received — shutting down gracefully…`);
    io.close();
    httpServer.close();
    await (0, db_1.disconnectDB)();
    process.exit(0);
};
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
// ─── Unhandled Errors ────────────────────────────────────────
process.on('unhandledRejection', (reason) => {
    console.error('UNHANDLED REJECTION:', reason);
    shutdown('unhandledRejection');
});
process.on('uncaughtException', (error) => {
    console.error('UNCAUGHT EXCEPTION:', error);
    shutdown('uncaughtException');
});
// ─── Go! ─────────────────────────────────────────────────────
start();
//# sourceMappingURL=index.js.map