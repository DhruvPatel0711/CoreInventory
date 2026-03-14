import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';
import * as movementService from '../services/movement.service';

// ─── POST /api/adjustments — Manual stock correction ─────────
export const createAdjustment = asyncHandler(async (req: Request, res: Response) => {
  const { productId, locationId, quantity, reference, notes } = req.body;

  if (!productId || !locationId || quantity === undefined) {
    throw new ApiError(400, 'productId, locationId, and quantity are required');
  }

  const movement = await movementService.adjust({
    productId,
    locationId,
    quantity: Number(quantity),
    reference,
    notes,
    performedBy: String(req.user!._id),
  });

  res.status(201).json({
    success: true,
    message: 'Adjustment recorded — stock updated',
    data: movement,
  });
});

// ─── GET /api/adjustments — List adjustment movements ────────
export const listAdjustments = asyncHandler(async (req: Request, res: Response) => {
  const { productId, page, limit } = req.query;

  const result = await movementService.getMovements({
    type: 'ADJUSTMENT',
    productId: productId as string,
    page: page ? parseInt(page as string, 10) : undefined,
    limit: limit ? parseInt(limit as string, 10) : undefined,
  });

  res.json({ success: true, ...result });
});
