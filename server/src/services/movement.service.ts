import mongoose from 'mongoose';
import Inventory from '../models/Inventory';
import InventoryMovement from '../models/InventoryMovement';
import { ApiError } from '../utils/ApiError';
import { getIO } from '../config/socket';

// ─── Movement Input Types ────────────────────────────────────
interface BaseMovementInput {
  productId: string;
  quantity: number;
  reference?: string;
  notes?: string;
  performedBy: string;
}

export interface ReceiptInput extends BaseMovementInput {
  toLocationId: string;
}

export interface DeliveryInput extends BaseMovementInput {
  fromLocationId: string;
}

export interface TransferInput extends BaseMovementInput {
  fromLocationId: string;
  toLocationId: string;
}

export interface AdjustmentInput extends BaseMovementInput {
  locationId: string;
  // quantity can be positive (add) or negative (remove)
}

// ─── Core Transactional Engine ─────────────────────────────────
async function executeMovement(params: {
  productId: string;
  type: 'RECEIPT' | 'DELIVERY' | 'TRANSFER' | 'ADJUSTMENT';
  quantity: number;
  fromLocationId?: string | null;
  toLocationId?: string | null;
  reference?: string;
  notes?: string;
  performedBy: string;
}) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. Decrement source location (DELIVERY, TRANSFER, ADJUSTMENT with negative qty)
    if (params.fromLocationId) {
      const decrementQty =
        params.type === 'ADJUSTMENT' ? params.quantity : -params.quantity;

      const inv = await Inventory.findOneAndUpdate(
        { productId: params.productId, locationId: params.fromLocationId },
        {
          $inc: {
            quantity: params.type === 'ADJUSTMENT' ? params.quantity : -params.quantity,
          },
        },
        { session, new: true }
      );

      if (!inv) {
        throw new ApiError(
          400,
          'No inventory record found at the source location for this product'
        );
      }

      if (inv.quantity < 0) {
        throw new ApiError(
          400,
          `Insufficient stock. Available: ${inv.quantity + (params.type === 'ADJUSTMENT' ? -params.quantity : params.quantity)}, Requested: ${params.quantity}`
        );
      }
    }

    // 2. Increment destination location (RECEIPT, TRANSFER)
    if (params.toLocationId) {
      await Inventory.findOneAndUpdate(
        { productId: params.productId, locationId: params.toLocationId },
        { $inc: { quantity: params.quantity } },
        { session, upsert: true, new: true }
      );
    }

    // 3. Create movement record
    const [movement] = await InventoryMovement.create(
      [
        {
          productId: params.productId,
          type: params.type,
          quantity: params.quantity,
          fromLocation: params.fromLocationId || null,
          toLocation: params.toLocationId || null,
          reference: params.reference,
          notes: params.notes,
          performedBy: params.performedBy,
        },
      ],
      { session }
    );

    // 4. Commit
    await session.commitTransaction();

    // 5. Emit real-time event (outside transaction)
    try {
      const io = getIO();
      io.emit('inventory:updated', {
        type: params.type,
        productId: params.productId,
        fromLocationId: params.fromLocationId,
        toLocationId: params.toLocationId,
        quantity: params.quantity,
        movementId: String(movement._id),
        timestamp: new Date().toISOString(),
      });
    } catch {
      // Socket not initialized (e.g. during tests) — non-fatal
      console.warn('⚠️  Socket.io not available, skipping event emit');
    }

    return movement;
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
}

// ─── Public Wrapper Functions ────────────────────────────────

/**
 * RECEIPT — Goods arriving into a warehouse location.
 * Increases stock at toLocationId.
 */
export const receive = async (input: ReceiptInput) => {
  if (input.quantity <= 0) {
    throw new ApiError(400, 'Receipt quantity must be positive');
  }

  return executeMovement({
    productId: input.productId,
    type: 'RECEIPT',
    quantity: input.quantity,
    fromLocationId: null,
    toLocationId: input.toLocationId,
    reference: input.reference,
    notes: input.notes,
    performedBy: input.performedBy,
  });
};

/**
 * DELIVERY — Goods shipped out from a warehouse location.
 * Decreases stock at fromLocationId.
 */
export const deliver = async (input: DeliveryInput) => {
  if (input.quantity <= 0) {
    throw new ApiError(400, 'Delivery quantity must be positive');
  }

  return executeMovement({
    productId: input.productId,
    type: 'DELIVERY',
    quantity: input.quantity,
    fromLocationId: input.fromLocationId,
    toLocationId: null,
    reference: input.reference,
    notes: input.notes,
    performedBy: input.performedBy,
  });
};

/**
 * TRANSFER — Move stock between two locations.
 * Decreases fromLocationId, increases toLocationId.
 */
export const transfer = async (input: TransferInput) => {
  if (input.quantity <= 0) {
    throw new ApiError(400, 'Transfer quantity must be positive');
  }

  if (input.fromLocationId === input.toLocationId) {
    throw new ApiError(400, 'Source and destination locations must be different');
  }

  return executeMovement({
    productId: input.productId,
    type: 'TRANSFER',
    quantity: input.quantity,
    fromLocationId: input.fromLocationId,
    toLocationId: input.toLocationId,
    reference: input.reference,
    notes: input.notes,
    performedBy: input.performedBy,
  });
};

/**
 * ADJUSTMENT — Manual stock correction.
 * Positive quantity adds stock, negative removes stock.
 */
export const adjust = async (input: AdjustmentInput) => {
  if (input.quantity === 0) {
    throw new ApiError(400, 'Adjustment quantity must be non-zero');
  }

  return executeMovement({
    productId: input.productId,
    type: 'ADJUSTMENT',
    quantity: input.quantity,
    fromLocationId: input.locationId,
    toLocationId: null,
    reference: input.reference,
    notes: input.notes,
    performedBy: input.performedBy,
  });
};

// ─── Query Helpers ───────────────────────────────────────────

/**
 * Get movement history with optional filters.
 */
export const getMovements = async (filters: {
  type?: string;
  productId?: string;
  page?: number;
  limit?: number;
}) => {
  const { type, productId, page = 1, limit = 20 } = filters;

  const query: Record<string, any> = {};
  if (type) query.type = type;
  if (productId) query.productId = productId;

  const pageNum = Math.max(1, page);
  const limitNum = Math.min(100, Math.max(1, limit));
  const skip = (pageNum - 1) * limitNum;

  const [data, total] = await Promise.all([
    InventoryMovement.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('productId', 'name sku')
      .populate('fromLocation', 'rackCode')
      .populate('toLocation', 'rackCode')
      .populate('performedBy', 'name email'),
    InventoryMovement.countDocuments(query),
  ]);

  return {
    data,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum),
  };
};
