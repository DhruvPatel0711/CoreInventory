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

export const createWarehouse = asyncHandler(async (req: Request, res: Response) => {
  const data = await warehouseService.createWarehouse(req.body);
  res.status(201).json({ success: true, data });
});

export const updateWarehouse = asyncHandler(async (req: Request, res: Response) => {
  const data = await warehouseService.updateWarehouse(req.params.id as string, req.body);
  res.json({ success: true, data });
});

export const createRack = asyncHandler(async (req: Request, res: Response) => {
  const { warehouseId, rackCode, capacity } = req.body;
  if (!warehouseId || !rackCode || !capacity) {
    throw new Error('warehouseId, rackCode, and capacity are required');
  }
  const data = await warehouseService.createRack({ warehouseId, rackCode, capacity });
  res.status(201).json({ success: true, data });
});
