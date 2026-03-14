import mongoose, { Schema, Document, Types } from 'mongoose';

// ─── Movement Type Enum ──────────────────────────────────────
export const MOVEMENT_TYPES = ['RECEIPT', 'DELIVERY', 'TRANSFER', 'ADJUSTMENT'] as const;
export type MovementType = (typeof MOVEMENT_TYPES)[number];

// ─── Interface ───────────────────────────────────────────────
export interface IInventoryMovement extends Document {
  productId: Types.ObjectId;
  type: MovementType;
  quantity: number;
  fromLocation: Types.ObjectId | null;
  toLocation: Types.ObjectId | null;
  reference?: string;
  notes?: string;
  performedBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Schema ──────────────────────────────────────────────────
const inventoryMovementSchema = new Schema<IInventoryMovement>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',                            // ← Relationship: which product moved
      required: [true, 'Product ID is required'],
    },
    type: {
      type: String,
      required: [true, 'Movement type is required'],
      enum: {
        values: MOVEMENT_TYPES,
        message: 'Type must be RECEIPT, DELIVERY, TRANSFER, or ADJUSTMENT',
      },
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
    },
    fromLocation: {
      type: Schema.Types.ObjectId,
      ref: 'Location',                           // ← Relationship: source rack
      default: null,
      // Required for DELIVERY, TRANSFER, ADJUSTMENT — validated in pre-validate hook
    },
    toLocation: {
      type: Schema.Types.ObjectId,
      ref: 'Location',                           // ← Relationship: destination rack
      default: null,
      // Required for RECEIPT, TRANSFER — validated in pre-validate hook
    },
    reference: {
      type: String,
      trim: true,
      maxlength: [100, 'Reference cannot exceed 100 characters'],
      // e.g., PO number, invoice number, transfer ticket ID
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
    },
    performedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',                               // ← Relationship: who performed this action
      required: [true, 'Performed-by user is required'],
    },
  },
  {
    timestamps: true, // createdAt = when the movement happened
  }
);

// ─── Indexes ─────────────────────────────────────────────────
// History for a specific product
inventoryMovementSchema.index({ productId: 1, createdAt: -1 });

// Dashboard: recent movements of a given type
inventoryMovementSchema.index({ type: 1, createdAt: -1 });

// Analytics: all movements in a date range
inventoryMovementSchema.index({ createdAt: -1 });

// Trace movements at a specific location
inventoryMovementSchema.index({ fromLocation: 1, createdAt: -1 });
inventoryMovementSchema.index({ toLocation: 1, createdAt: -1 });

// Audit: who did what
inventoryMovementSchema.index({ performedBy: 1, createdAt: -1 });

// ─── Custom Validation (pre-validate hook) ──────────────────
inventoryMovementSchema.pre('validate', function () {
  const movementType = this.get('type') as MovementType;
  const qty = this.get('quantity') as number;
  const from = this.get('fromLocation');
  const to = this.get('toLocation');

  // Quantity validation: non-zero for adjustments, positive for everything else
  if (movementType === 'ADJUSTMENT' && qty === 0) {
    throw new Error('ADJUSTMENT quantity must be non-zero');
  }
  if (movementType !== 'ADJUSTMENT' && qty <= 0) {
    throw new Error('Quantity must be positive');
  }

  // Location validation per movement type
  switch (movementType) {
    case 'RECEIPT':
      if (!to) throw new Error('RECEIPT requires a toLocation');
      break;
    case 'DELIVERY':
      if (!from) throw new Error('DELIVERY requires a fromLocation');
      break;
    case 'TRANSFER':
      if (!from || !to)
        throw new Error('TRANSFER requires both fromLocation and toLocation');
      if (String(from) === String(to))
        throw new Error('TRANSFER fromLocation and toLocation must be different');
      break;
    case 'ADJUSTMENT':
      if (!from) throw new Error('ADJUSTMENT requires a fromLocation');
      break;
  }
});

// ─── Serialization ──────────────────────────────────────────
inventoryMovementSchema.set('toJSON', {
  transform(_doc, ret) {
    const { __v, ...rest } = ret;
    return rest;
  },
});

// ─── Export ──────────────────────────────────────────────────
const InventoryMovement = mongoose.model<IInventoryMovement>(
  'InventoryMovement',
  inventoryMovementSchema
);
export default InventoryMovement;

/*
┌─────────────────────────────────────────────────────────────────┐
│  EXAMPLE DOCUMENTS                                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ── RECEIPT (incoming goods) ──                                 │
│  {                                                              │
│    "_id": "665f6a7b8c9d0e1f20314253",                          │
│    "productId": "665b2c3d4e5f6a7b8c9d0e1f",                    │
│    "type": "RECEIPT",                                           │
│    "quantity": 200,                                             │
│    "fromLocation": null,                                        │
│    "toLocation": "665d4e5f6a7b8c9d0e1f2031",                   │
│    "reference": "PO-2026-0042",                                 │
│    "notes": "Shipment from supplier XYZ",                       │
│    "performedBy": "665a1b2c3d4e5f6a7b8c9d0e",                  │
│    "createdAt": "2026-03-14T05:00:00.000Z"                      │
│  }                                                              │
│                                                                 │
│  ── DELIVERY (outgoing goods) ──                                │
│  {                                                              │
│    "_id": "665f6a7b8c9d0e1f20314254",                          │
│    "productId": "665b2c3d4e5f6a7b8c9d0e1f",                    │
│    "type": "DELIVERY",                                          │
│    "quantity": 50,                                              │
│    "fromLocation": "665d4e5f6a7b8c9d0e1f2031",                 │
│    "toLocation": null,                                          │
│    "reference": "INV-2026-0101",                                │
│    "performedBy": "665a1b2c3d4e5f6a7b8c9d0e",                  │
│    "createdAt": "2026-03-14T06:00:00.000Z"                      │
│  }                                                              │
│                                                                 │
│  ── TRANSFER (between racks) ──                                 │
│  {                                                              │
│    "_id": "665f6a7b8c9d0e1f20314255",                          │
│    "productId": "665b2c3d4e5f6a7b8c9d0e1f",                    │
│    "type": "TRANSFER",                                          │
│    "quantity": 30,                                              │
│    "fromLocation": "665d4e5f6a7b8c9d0e1f2031",                 │
│    "toLocation": "665d4e5f6a7b8c9d0e1f2032",                   │
│    "notes": "Rebalancing stock across racks",                   │
│    "performedBy": "665a1b2c3d4e5f6a7b8c9d0e",                  │
│    "createdAt": "2026-03-14T07:00:00.000Z"                      │
│  }                                                              │
│                                                                 │
│  ── ADJUSTMENT (stock correction) ──                            │
│  {                                                              │
│    "_id": "665f6a7b8c9d0e1f20314256",                          │
│    "productId": "665b2c3d4e5f6a7b8c9d0e1f",                    │
│    "type": "ADJUSTMENT",                                        │
│    "quantity": -5,                                              │
│    "fromLocation": "665d4e5f6a7b8c9d0e1f2031",                 │
│    "toLocation": null,                                          │
│    "notes": "Physical count found 5 fewer than system",         │
│    "performedBy": "665a1b2c3d4e5f6a7b8c9d0e",                  │
│    "createdAt": "2026-03-14T08:00:00.000Z"                      │
│  }                                                              │
│                                                                 │
│  RELATIONSHIPS                                                  │
│  ├─ productId    → Product._id   (which product moved)          │
│  ├─ fromLocation → Location._id  (source rack, null for RECEIPT)│
│  ├─ toLocation   → Location._id  (dest rack, null for DELIVERY) │
│  └─ performedBy  → User._id      (who executed the movement)    │
└─────────────────────────────────────────────────────────────────┘
*/
