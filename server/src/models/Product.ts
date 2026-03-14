import mongoose, { Schema, Document } from 'mongoose';

// ─── Interface ───────────────────────────────────────────────
export interface IProduct extends Document {
  name: string;
  sku: string;
  category: string;
  unit: string;
  reorderLevel: number;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Schema ──────────────────────────────────────────────────
const productSchema = new Schema<IProduct>(
  {
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
  },
  {
    timestamps: true,
  }
);

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
const Product = mongoose.model<IProduct>('Product', productSchema);
export default Product;

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
