import mongoose, { Schema, Document, Types } from 'mongoose';

// ─── Interface ───────────────────────────────────────────────
export interface ILocation extends Document {
  warehouseId: Types.ObjectId;
  rackCode: string;
  capacity: number;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Schema ──────────────────────────────────────────────────
const locationSchema = new Schema<ILocation>(
  {
    warehouseId: {
      type: Schema.Types.ObjectId,
      ref: 'Warehouse',                          // ← Relationship: belongs to Warehouse
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
  },
  {
    timestamps: true,
  }
);

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
const Location = mongoose.model<ILocation>('Location', locationSchema);
export default Location;

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
