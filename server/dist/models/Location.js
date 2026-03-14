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
const locationSchema = new mongoose_1.Schema({
    warehouseId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Warehouse', // ← Relationship: belongs to Warehouse
        required: [true, 'Warehouse ID is required'],
        index: true,
    },
    rackCode: {
        type: String,
        required: [true, 'Rack code is required'],
        uppercase: true,
        trim: true,
        match: [
            /^[A-Z]\d{1,3}$/,
            'Rack code must be a letter followed by 1-3 digits (e.g. A1, B12)',
        ],
    },
    capacity: {
        type: Number,
        required: [true, 'Capacity is required'],
        min: [1, 'Capacity must be at least 1'],
    },
}, {
    timestamps: true,
});
// ─── Indexes ─────────────────────────────────────────────────
// Each rack code must be unique within a warehouse
locationSchema.index({ warehouseId: 1, rackCode: 1 }, { unique: true });
// Fast lookup: all locations in a warehouse
locationSchema.index({ warehouseId: 1 });
// ─── Serialization ──────────────────────────────────────────
locationSchema.set('toJSON', {
    transform(_doc, ret) {
        const { __v, ...rest } = ret;
        return rest;
    },
});
// ─── Export ──────────────────────────────────────────────────
const Location = mongoose_1.default.model('Location', locationSchema);
exports.default = Location;
/*
┌─────────────────────────────────────────────────────────┐
│  EXAMPLE DOCUMENT                                       │
├─────────────────────────────────────────────────────────┤
│  {                                                      │
│    "_id": "665d4e5f6a7b8c9d0e1f2031",                  │
│    "warehouseId": "665c3d4e5f6a7b8c9d0e1f20",          │
│    "rackCode": "A1",                                    │
│    "capacity": 500,                                     │
│    "createdAt": "2026-03-14T04:30:00.000Z",             │
│    "updatedAt": "2026-03-14T04:30:00.000Z"              │
│  }                                                      │
│                                                         │
│  RELATIONSHIP                                           │
│  └─ warehouseId → Warehouse._id                         │
│     "This rack lives inside the Mumbai warehouse"       │
└─────────────────────────────────────────────────────────┘
*/
//# sourceMappingURL=Location.js.map