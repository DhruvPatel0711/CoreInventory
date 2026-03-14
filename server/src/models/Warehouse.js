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
var warehouseSchema = new mongoose_1.Schema({
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
    transform: function (_doc, ret) {
        var __v = ret.__v, rest = __rest(ret, ["__v"]);
        return rest;
    },
});
// ─── Export ──────────────────────────────────────────────────
var Warehouse = mongoose_1.default.model('Warehouse', warehouseSchema);
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
