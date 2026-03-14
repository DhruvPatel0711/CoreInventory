import mongoose, { Schema, Document } from 'mongoose';

// ─── Interface ───────────────────────────────────────────────
export interface IWarehouse extends Document {
  name: string;
  location: string;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Schema ──────────────────────────────────────────────────
const warehouseSchema = new Schema<IWarehouse>(
  {
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
  },
  {
    timestamps: true,
  }
);

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
const Warehouse = mongoose.model<IWarehouse>('Warehouse', warehouseSchema);
export default Warehouse;

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
