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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProductInventory = exports.listInventory = void 0;
const asyncHandler_1 = require("../utils/asyncHandler");
const Inventory_1 = __importDefault(require("../models/Inventory"));
// ─── GET /api/inventory — All stock levels ───────────────────
exports.listInventory = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { warehouseId, page = '1', limit = '50' } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;
    // Build a pipeline to join product and location info
    const matchStage = {};
    const pipeline = [
        { $match: { quantity: { $gt: 0 } } }, // Only show locations with stock
        {
            $lookup: {
                from: 'products',
                localField: 'productId',
                foreignField: '_id',
                as: 'product',
            },
        },
        { $unwind: '$product' },
        {
            $lookup: {
                from: 'locations',
                localField: 'locationId',
                foreignField: '_id',
                as: 'location',
            },
        },
        { $unwind: '$location' },
    ];
    // Optional warehouse filter
    if (warehouseId) {
        const mongoose = await Promise.resolve().then(() => __importStar(require('mongoose')));
        pipeline.push({
            $match: { 'location.warehouseId': new mongoose.Types.ObjectId(warehouseId) },
        });
    }
    pipeline.push({
        $project: {
            _id: 1,
            quantity: 1,
            'product._id': 1,
            'product.name': 1,
            'product.sku': 1,
            'product.category': 1,
            'product.unit': 1,
            'product.reorderLevel': 1,
            'location._id': 1,
            'location.rackCode': 1,
            'location.capacity': 1,
            'location.warehouseId': 1,
        },
    }, { $sort: { 'product.name': 1, 'location.rackCode': 1 } }, { $skip: skip }, { $limit: limitNum });
    const data = await Inventory_1.default.aggregate(pipeline);
    // Total count (without pagination)
    const countPipeline = pipeline.filter((s) => !('$skip' in s) && !('$limit' in s));
    countPipeline.push({ $count: 'total' });
    const countResult = await Inventory_1.default.aggregate(countPipeline);
    const total = countResult[0]?.total || 0;
    res.json({
        success: true,
        data,
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
    });
});
// ─── GET /api/inventory/:productId — Stock for one product ───
exports.getProductInventory = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const mongoose = await Promise.resolve().then(() => __importStar(require('mongoose')));
    const productId = new mongoose.Types.ObjectId(req.params.productId);
    const data = await Inventory_1.default.aggregate([
        { $match: { productId } },
        {
            $lookup: {
                from: 'locations',
                localField: 'locationId',
                foreignField: '_id',
                as: 'location',
            },
        },
        { $unwind: '$location' },
        {
            $lookup: {
                from: 'warehouses',
                localField: 'location.warehouseId',
                foreignField: '_id',
                as: 'warehouse',
            },
        },
        { $unwind: '$warehouse' },
        {
            $project: {
                _id: 1,
                quantity: 1,
                'location._id': 1,
                'location.rackCode': 1,
                'location.capacity': 1,
                'warehouse._id': 1,
                'warehouse.name': 1,
            },
        },
        { $sort: { 'warehouse.name': 1, 'location.rackCode': 1 } },
    ]);
    // Calculate total stock across all locations
    const totalQuantity = data.reduce((sum, item) => sum + item.quantity, 0);
    res.json({
        success: true,
        productId: req.params.productId,
        totalQuantity,
        locations: data,
    });
});
//# sourceMappingURL=inventory.controller.js.map