import mongoose, { Schema, Document, Types } from 'mongoose';

// ─── Interface ───────────────────────────────────────────────
export interface IInventory extends Document {
  productId: Types.ObjectId;
  locationId: Types.ObjectId;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Schema ──────────────────────────────────────────────────
const inventorySchema = new Schema<IInventory>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',                            // ← Relationship: references Product
      required: [true, 'Product ID is required'],
    },
    locationId: {
      type: Schema.Types.ObjectId,
      ref: 'Location',                           // ← Relationship: references Location
      required: [true, 'Location ID is required'],
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [0, 'Quantity cannot be negative'],
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

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
    delete ret.__v;
    return ret;
  },
});

// ─── Export ──────────────────────────────────────────────────
const Inventory = mongoose.model<IInventory>('Inventory', inventorySchema);
export default Inventory;

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
