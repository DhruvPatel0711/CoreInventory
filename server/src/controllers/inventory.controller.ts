import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import Inventory from '../models/Inventory';

// ─── GET /api/inventory — All stock levels ───────────────────
export const listInventory = asyncHandler(async (req: Request, res: Response) => {
  const { warehouseId, page = '1', limit = '50' } = req.query;

  const pageNum = Math.max(1, parseInt(page as string, 10));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10)));
  const skip = (pageNum - 1) * limitNum;

  // Build a pipeline to join product and location info
  const matchStage: Record<string, any> = {};

  const pipeline: any[] = [
    { $match: { quantity: { $gt: 0 } } }, // Only show locations with stock
    {
      $lookup: {
        from: 'products',
        localField: 'productId',
        foreignField: '_id',
        as: 'product',
      },
    },
    { $unwind: '$product' },
    {
      $lookup: {
        from: 'locations',
        localField: 'locationId',
        foreignField: '_id',
        as: 'location',
      },
    },
    { $unwind: '$location' },
  ];

  // Optional warehouse filter
  if (warehouseId) {
    const mongoose = await import('mongoose');
    pipeline.push({
      $match: { 'location.warehouseId': new mongoose.Types.ObjectId(warehouseId as string) },
    });
  }

  pipeline.push(
    {
      $project: {
        _id: 1,
        quantity: 1,
        'product._id': 1,
        'product.name': 1,
        'product.sku': 1,
        'product.category': 1,
        'product.unit': 1,
        'product.reorderLevel': 1,
        'location._id': 1,
        'location.rackCode': 1,
        'location.capacity': 1,
        'location.warehouseId': 1,
      },
    },
    { $sort: { 'product.name': 1, 'location.rackCode': 1 } },
    { $skip: skip },
    { $limit: limitNum }
  );

  const data = await Inventory.aggregate(pipeline);

  // Total count (without pagination)
  const countPipeline = pipeline.filter(
    (s) => !('$skip' in s) && !('$limit' in s)
  );
  countPipeline.push({ $count: 'total' });
  const countResult = await Inventory.aggregate(countPipeline);
  const total = countResult[0]?.total || 0;

  res.json({
    success: true,
    data,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum),
  });
});

// ─── GET /api/inventory/:productId — Stock for one product ───
export const getProductInventory = asyncHandler(async (req: Request, res: Response) => {
  const mongoose = await import('mongoose');
  const productId = new mongoose.Types.ObjectId(req.params.productId as string);

  const data = await Inventory.aggregate([
    { $match: { productId } },
    {
      $lookup: {
        from: 'locations',
        localField: 'locationId',
        foreignField: '_id',
        as: 'location',
      },
    },
    { $unwind: '$location' },
    {
      $lookup: {
        from: 'warehouses',
        localField: 'location.warehouseId',
        foreignField: '_id',
        as: 'warehouse',
      },
    },
    { $unwind: '$warehouse' },
    {
      $project: {
        _id: 1,
        quantity: 1,
        'location._id': 1,
        'location.rackCode': 1,
        'location.capacity': 1,
        'warehouse._id': 1,
        'warehouse.name': 1,
      },
    },
    { $sort: { 'warehouse.name': 1, 'location.rackCode': 1 } },
  ]);

  // Calculate total stock across all locations
  const totalQuantity = data.reduce((sum, item) => sum + item.quantity, 0);

  res.json({
    success: true,
    productId: req.params.productId,
    totalQuantity,
    locations: data,
  });
});
