"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_routes_1 = __importDefault(require("./auth.routes"));
const product_routes_1 = __importDefault(require("./product.routes"));
const receipt_routes_1 = __importDefault(require("./receipt.routes"));
const delivery_routes_1 = __importDefault(require("./delivery.routes"));
const transfer_routes_1 = __importDefault(require("./transfer.routes"));
const adjustment_routes_1 = __importDefault(require("./adjustment.routes"));
const warehouse_routes_1 = __importDefault(require("./warehouse.routes"));
const inventory_routes_1 = __importDefault(require("./inventory.routes"));
const analytics_routes_1 = __importDefault(require("./analytics.routes"));
const router = (0, express_1.Router)();
// ─── Health Check ────────────────────────────────────────────
router.get('/health', (_req, res) => {
    res.json({
        success: true,
        message: 'CoreInventory API is running',
        timestamp: new Date().toISOString(),
    });
});
// ─── Mount Module Routes ─────────────────────────────────────
router.use('/auth', auth_routes_1.default);
router.use('/products', product_routes_1.default);
router.use('/receipts', receipt_routes_1.default);
router.use('/deliveries', delivery_routes_1.default);
router.use('/transfers', transfer_routes_1.default);
router.use('/adjustments', adjustment_routes_1.default);
router.use('/warehouses', warehouse_routes_1.default);
router.use('/inventory', inventory_routes_1.default);
router.use('/analytics', analytics_routes_1.default);
exports.default = router;
//# sourceMappingURL=index.js.map