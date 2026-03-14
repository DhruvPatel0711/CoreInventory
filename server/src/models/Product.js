"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
// ─── Schema ──────────────────────────────────────────────────
var productSchema = new mongoose_1.Schema({
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
    transform: function (_doc, ret) {
        var __v = ret.__v, rest = __rest(ret, ["__v"]);
        return rest;
    },
});
// ─── Export ──────────────────────────────────────────────────
var Product = mongoose_1.default.model('Product', productSchema);
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
