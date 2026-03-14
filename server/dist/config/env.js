"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Load .env from server root
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../.env') });
function getEnv() {
    const required = ['MONGO_URI', 'JWT_SECRET'];
    for (const key of required) {
        if (!process.env[key]) {
            throw new Error(`❌  Missing required env variable: ${key}`);
        }
    }
    return {
        PORT: parseInt(process.env.PORT || '5000', 10),
        NODE_ENV: process.env.NODE_ENV || 'development',
        MONGO_URI: process.env.MONGO_URI,
        JWT_SECRET: process.env.JWT_SECRET,
        JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
        CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000',
    };
}
exports.env = getEnv();
//# sourceMappingURL=env.js.map