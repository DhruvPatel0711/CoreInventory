"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMovementTrends = exports.getHealth = exports.getDashboard = void 0;
const asyncHandler_1 = require("../utils/asyncHandler");
const analyticsService = __importStar(require("../services/analytics.service"));
// ─── GET /api/analytics/dashboard ────────────────────────────
exports.getDashboard = (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
    const data = await analyticsService.getDashboardData();
    res.json({
        success: true,
        data,
    });
});
// ─── GET /api/analytics/health ───────────────────────────────
exports.getHealth = (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
    const data = await analyticsService.getHealthScore();
    res.json({
        success: true,
        data,
    });
});
// ─── GET /api/analytics/movements?days=30 ────────────────────
exports.getMovementTrends = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const days = req.query.days ? parseInt(req.query.days, 10) : 30;
    const data = await analyticsService.getMovementTrends(days);
    res.json({
        success: true,
        data,
    });
});
//# sourceMappingURL=analytics.controller.js.map