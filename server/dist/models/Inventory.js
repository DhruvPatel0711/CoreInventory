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
const mongoose_1 = __importStar(require("mongoose"));
// ─── Schema ──────────────────────────────────────────────────
const inventorySchema = new mongoose_1.Schema({
    productId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Product', // ← Relationship: references Product
        required: [true, 'Product ID is required'],
    },
    locationId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Location', // ← Relationship: references Location
        required: [true, 'Location ID is required'],
    },
    quantity: {
        type: Number,
        required: [true, 'Quantity is required'],
        min: [0, 'Quantity cannot be negative'],
        default: 0,
    },
}, {
    timestamps: true,
});
// ─── Indexes ─────────────────────────────────────────────────
// Core index: one inventory record per product per location (upsert target)
inventorySchema.index({ productId: 1, locationId: 1 }, { unique: true });
// Dashboard queries: total stock for a product across all locations
inventorySchema.index({ productId: 1 });
// Warehouse visualization: all stock at a specific location
inventorySchema.index({ locationId: 1 });
// Analytics: find low-stock items quickly
inventorySchema.index({ quantity: 1 });
// ─── Serialization ──────────────────────────────────────────
inventorySchema.set('toJSON', {
    transform(_doc, ret) {
        const { __v, ...rest } = ret;
        return rest;
    },
});
// ─── Export ──────────────────────────────────────────────────
const Inventory = mongoose_1.default.model('Inventory', inventorySchema);
exports.default = Inventory;
/*
┌─────────────────────────────────────────────────────────┐
│  EXAMPLE DOCUMENT                                       │
├─────────────────────────────────────────────────────────┤
│  {                                                      │
│    "_id": "665e5f6a7b8c9d0e1f203142",                  │
│    "productId": "665b2c3d4e5f6a7b8c9d0e1f",            │
│    "locationId": "665d4e5f6a7b8c9d0e1f2031",           │
│    "quantity": 120,                                     │
│    "createdAt": "2026-03-14T04:40:00.000Z",             │
│    "updatedAt": "2026-03-14T05:15:00.000Z"              │
│  }                                                      │
│                                                         │
│  RELATIONSHIPS                                          │
│  ├─ productId  → Product._id                            │
│  │  "120 units of Wireless Keyboard"                    │
│  └─ locationId → Location._id                           │
│     "…stored at rack A1 in Mumbai warehouse"            │
└─────────────────────────────────────────────────────────┘
*/
//# sourceMappingURL=Inventory.js.map