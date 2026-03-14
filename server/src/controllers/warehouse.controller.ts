import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import * as warehouseService from '../services/warehouse.service';

// ─── GET /api/warehouses ─────────────────────────────────────
export const listWarehouses = asyncHandler(async (_req: Request, res: Response) => {
  const data = await warehouseService.listWarehouses();

  res.json({
    success: true,
    data,
  });
});

// ─── GET /api/warehouses/:id/locations ───────────────────────
export const getWarehouseLocations = asyncHandler(async (req: Request, res: Response) => {
  const data = await warehouseService.getWarehouseLocations(req.params.id as string);

  res.json({
    success: true,
    data,
  });
});
