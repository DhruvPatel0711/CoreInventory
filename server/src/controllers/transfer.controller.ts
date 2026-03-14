import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';
import * as movementService from '../services/movement.service';

// ─── POST /api/transfers — Move stock between locations ──────
export const createTransfer = asyncHandler(async (req: Request, res: Response) => {
  const { productId, fromLocationId, toLocationId, quantity, reference, notes } = req.body;

  if (!productId || !fromLocationId || !toLocationId || !quantity) {
    throw new ApiError(
      400,
      'productId, fromLocationId, toLocationId, and quantity are required'
    );
  }

  const movement = await movementService.transfer({
    productId,
    fromLocationId,
    toLocationId,
    quantity: Number(quantity),
    reference,
    notes,
    performedBy: String(req.user!._id),
  });

  res.status(201).json({
    success: true,
    message: 'Transfer recorded — stock updated',
    data: movement,
  });
});

// ─── GET /api/transfers — List transfer movements ────────────
export const listTransfers = asyncHandler(async (req: Request, res: Response) => {
  const { productId, page, limit } = req.query;

  const result = await movementService.getMovements({
    type: 'TRANSFER',
    productId: productId as string,
    page: page ? parseInt(page as string, 10) : undefined,
    limit: limit ? parseInt(limit as string, 10) : undefined,
  });

  res.json({ success: true, ...result });
});
