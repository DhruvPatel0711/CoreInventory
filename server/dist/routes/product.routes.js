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
const express_1 = require("express");
const productController = __importStar(require("../controllers/product.controller"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const role_middleware_1 = require("../middleware/role.middleware");
const router = (0, express_1.Router)();
// ─── Public Routes ───────────────────────────────────────────
// GET  /api/products              — List products (filter, search, paginate)
// GET  /api/products/sku/:sku     — Get product by exact SKU
// GET  /api/products/:id          — Get product by ID
router.get('/', productController.listProducts);
router.get('/sku/:sku', productController.getProductBySku);
router.get('/:id', productController.getProductById);
// ─── Protected Routes (auth required) ────────────────────────
// POST   /api/products            — Create product
// PUT    /api/products/:id        — Update product
// DELETE /api/products/:id        — Delete product (admin/manager only)
router.post('/', auth_middleware_1.authenticate, productController.createProduct);
router.put('/:id', auth_middleware_1.authenticate, productController.updateProduct);
router.delete('/:id', auth_middleware_1.authenticate, (0, role_middleware_1.authorise)('admin', 'manager'), productController.deleteProduct);
exports.default = router;
//# sourceMappingURL=product.routes.js.map