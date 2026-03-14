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
const productSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true,
        maxlength: [200, 'Product name cannot exceed 200 characters'],
    },
    sku: {
        type: String,
        required: [true, 'SKU is required'],
        unique: true,
        uppercase: true,
        trim: true,
        match: [/^[A-Z0-9\-]+$/, 'SKU must contain only letters, numbers, and hyphens'],
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        trim: true,
        enum: {
            values: [
                'Electronics',
                'Furniture',
                'Clothing',
                'Food & Beverage',
                'Raw Materials',
                'Packaging',
                'Office Supplies',
                'Other',
            ],
            message: '{VALUE} is not a valid category',
        },
    },
    unit: {
        type: String,
        required: [true, 'Unit of measure is required'],
        trim: true,
        enum: {
            values: ['pcs', 'kg', 'liters', 'meters', 'boxes', 'pallets', 'units'],
            message: '{VALUE} is not a valid unit',
        },
    },
    reorderLevel: {
        type: Number,
        required: [true, 'Reorder level is required'],
        min: [0, 'Reorder level cannot be negative'],
        default: 10,
    },
    description: {
        type: String,
        trim: true,
        maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
}, {
    timestamps: true,
});
// ─── Indexes ─────────────────────────────────────────────────
// Fast SKU lookups (unique already creates an index, but explicit for clarity)
productSchema.index({ sku: 1 }, { unique: true });
// Search / filter by category
productSchema.index({ category: 1 });
// Text index for product name search
productSchema.index({ name: 'text', description: 'text' });
// ─── Serialization ──────────────────────────────────────────
productSchema.set('toJSON', {
    transform(_doc, ret) {
        const { __v, ...rest } = ret;
        return rest;
    },
});
// ─── Export ──────────────────────────────────────────────────
const Product = mongoose_1.default.model('Product', productSchema);
exports.default = Product;
/*
┌─────────────────────────────────────────────────────────┐
│  EXAMPLE DOCUMENT                                       │
├─────────────────────────────────────────────────────────┤
│  {                                                      │
│    "_id": "665b2c3d4e5f6a7b8c9d0e1f",                  │
│    "name": "Wireless Bluetooth Keyboard",               │
│    "sku": "ELEC-KB-001",                                │
│    "category": "Electronics",                           │
│    "unit": "pcs",                                       │
│    "reorderLevel": 25,                                  │
│    "description": "Slim wireless keyboard, USB-C",      │
│    "createdAt": "2026-03-14T04:10:00.000Z",             │
│    "updatedAt": "2026-03-14T04:10:00.000Z"              │
│  }                                                      │
└─────────────────────────────────────────────────────────┘
*/
//# sourceMappingURL=Product.js.map