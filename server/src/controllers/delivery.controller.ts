import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';
import * as movementService from '../services/movement.service';

// ─── POST /api/deliveries — Ship goods from a location ───────
export const createDelivery = asyncHandler(async (req: Request, res: Response) => {
  const { productId, fromLocationId, quantity, reference, notes } = req.body;

  if (!productId || !fromLocationId || !quantity) {
    throw new ApiError(400, 'productId, fromLocationId, and quantity are required');
  }

  const movement = await movementService.deliver({
    productId,
    fromLocationId,
    quantity: Number(quantity),
    reference,
    notes,
    performedBy: String(req.user!._id),
  });

  res.status(201).json({
    success: true,
    message: 'Delivery recorded — stock updated',
    data: movement,
  });
});

// ─── GET /api/deliveries — List delivery movements ───────────
export const listDeliveries = asyncHandler(async (req: Request, res: Response) => {
  const { productId, page, limit } = req.query;

  const result = await movementService.getMovements({
    type: 'DELIVERY',
    productId: productId as string,
    page: page ? parseInt(page as string, 10) : undefined,
    limit: limit ? parseInt(limit as string, 10) : undefined,
  });

  res.json({ success: true, ...result });
});
