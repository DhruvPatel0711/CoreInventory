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
const warehouseSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, 'Warehouse name is required'],
        unique: true,
        trim: true,
        maxlength: [150, 'Warehouse name cannot exceed 150 characters'],
    },
    location: {
        type: String,
        required: [true, 'Location/address is required'],
        trim: true,
        maxlength: [300, 'Location cannot exceed 300 characters'],
    },
}, {
    timestamps: true,
});
// ─── Indexes ─────────────────────────────────────────────────
warehouseSchema.index({ name: 1 }, { unique: true });
// ─── Serialization ──────────────────────────────────────────
warehouseSchema.set('toJSON', {
    transform(_doc, ret) {
        const { __v, ...rest } = ret;
        return rest;
    },
});
// ─── Export ──────────────────────────────────────────────────
const Warehouse = mongoose_1.default.model('Warehouse', warehouseSchema);
exports.default = Warehouse;
/*
┌─────────────────────────────────────────────────────────┐
│  EXAMPLE DOCUMENT                                       │
├─────────────────────────────────────────────────────────┤
│  {                                                      │
│    "_id": "665c3d4e5f6a7b8c9d0e1f20",                  │
│    "name": "Main Warehouse - Mumbai",                   │
│    "location": "Plot 42, MIDC Andheri East, Mumbai",    │
│    "createdAt": "2026-03-14T04:20:00.000Z",             │
│    "updatedAt": "2026-03-14T04:20:00.000Z"              │
│  }                                                      │
└─────────────────────────────────────────────────────────┘
*/
//# sourceMappingURL=Warehouse.js.map