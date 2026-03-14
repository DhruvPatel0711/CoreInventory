import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';
import * as movementService from '../services/movement.service';

// ─── POST /api/receipts — Receive goods into a location ──────
export const createReceipt = asyncHandler(async (req: Request, res: Response) => {
  const { productId, toLocationId, quantity, reference, notes } = req.body;

  if (!productId || !toLocationId || !quantity) {
    throw new ApiError(400, 'productId, toLocationId, and quantity are required');
  }

  const movement = await movementService.receive({
    productId,
    toLocationId,
    quantity: Number(quantity),
    reference,
    notes,
    performedBy: String(req.user!._id),
  });

  res.status(201).json({
    success: true,
    message: 'Receipt recorded — stock updated',
    data: movement,
  });
});

// ─── GET /api/receipts — List receipt movements ──────────────
export const listReceipts = asyncHandler(async (req: Request, res: Response) => {
  const { productId, page, limit } = req.query;

  const result = await movementService.getMovements({
    type: 'RECEIPT',
    productId: productId as string,
    page: page ? parseInt(page as string, 10) : undefined,
    limit: limit ? parseInt(limit as string, 10) : undefined,
  });

  res.json({ success: true, ...result });
});
