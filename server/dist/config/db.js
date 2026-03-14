"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.disconnectDB = exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const env_1 = require("./env");
// ─── Connect to MongoDB ──────────────────────────────────────
const connectDB = async () => {
    try {
        const conn = await mongoose_1.default.connect(env_1.env.MONGO_URI);
        console.log(`✅  MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
    }
    catch (error) {
        console.error('❌  MongoDB connection failed:', error);
        process.exit(1);
    }
};
exports.connectDB = connectDB;
// ─── Graceful Shutdown ───────────────────────────────────────
const disconnectDB = async () => {
    await mongoose_1.default.disconnect();
    console.log('🔌  MongoDB disconnected');
};
exports.disconnectDB = disconnectDB;
//# sourceMappingURL=db.js.map