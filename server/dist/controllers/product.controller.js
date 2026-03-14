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
exports.deleteProduct = exports.updateProduct = exports.createProduct = exports.getProductById = exports.getProductBySku = exports.listProducts = void 0;
const asyncHandler_1 = require("../utils/asyncHandler");
const ApiError_1 = require("../utils/ApiError");
const productService = __importStar(require("../services/product.service"));
// ─── GET /api/products ───────────────────────────────────────
// Query params: ?category=Electronics&search=keyboard&sku=ELEC&page=1&limit=20&sort=-createdAt
exports.listProducts = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { category, search, sku, page, limit, sort } = req.query;
    const result = await productService.listProducts({
        category: category,
        search: search,
        sku: sku,
        page: page ? parseInt(page, 10) : undefined,
        limit: limit ? parseInt(limit, 10) : undefined,
        sort: sort,
    });
    res.json({
        success: true,
        ...result,
    });
});
// ─── GET /api/products/sku/:sku ──────────────────────────────
exports.getProductBySku = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const product = await productService.getProductBySku(req.params.sku);
    res.json({
        success: true,
        data: product,
    });
});
// ─── GET /api/products/:id ───────────────────────────────────
exports.getProductById = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const product = await productService.getProductById(req.params.id);
    res.json({
        success: true,
        data: product,
    });
});
// ─── POST /api/products ──────────────────────────────────────
exports.createProduct = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { name, sku, category, unit, reorderLevel, description } = req.body;
    if (!name || !sku || !category || !unit) {
        throw new ApiError_1.ApiError(400, 'Name, SKU, category, and unit are required');
    }
    const product = await productService.createProduct({
        name,
        sku,
        category,
        unit,
        reorderLevel,
        description,
    });
    res.status(201).json({
        success: true,
        message: 'Product created',
        data: product,
    });
});
// ─── PUT /api/products/:id ───────────────────────────────────
exports.updateProduct = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const product = await productService.updateProduct(req.params.id, req.body);
    res.json({
        success: true,
        message: 'Product updated',
        data: product,
    });
});
// ─── DELETE /api/products/:id ────────────────────────────────
exports.deleteProduct = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    await productService.deleteProduct(req.params.id);
    res.json({
        success: true,
        message: 'Product deleted',
    });
});
//# sourceMappingURL=product.controller.js.map