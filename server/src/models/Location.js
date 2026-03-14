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
var locationSchema = new mongoose_1.Schema({
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
    transform: function (_doc, ret) {
        var __v = ret.__v, rest = __rest(ret, ["__v"]);
        return rest;
    },
});
// ─── Export ──────────────────────────────────────────────────
var Location = mongoose_1.default.model('Location', locationSchema);
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
