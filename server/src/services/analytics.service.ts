import mongoose from 'mongoose';
import Product from '../models/Product';
import Inventory from '../models/Inventory';
import InventoryMovement from '../models/InventoryMovement';
import Location from '../models/Location';
import { calculateHealthScore, HealthResult } from '../utils/healthScore';

// ─── Dashboard KPIs ──────────────────────────────────────────
export interface DashboardData {
  totalProducts: number;
  totalStockQuantity: number;
  lowStockProducts: Array<{
    _id: string;
    name: string;
    sku: string;
    totalQuantity: number;
    reorderLevel: number;
  }>;
  recentMovements: any[];
  movementCounts: {
    receipts: number;
    deliveries: number;
    transfers: number;
    adjustments: number;
  };
}

export const getDashboardData = async (): Promise<DashboardData> => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [
    totalProducts,
    stockAgg,
    lowStockProducts,
    recentMovements,
    movementCountsAgg,
  ] = await Promise.all([
    // Total products
    Product.countDocuments(),

    // Total stock quantity across all locations
    Inventory.aggregate([
      { $group: { _id: null, total: { $sum: '$quantity' } } },
    ]),

    // Products below reorder level
    Inventory.aggregate([
      {
        $group: {
          _id: '$productId',
          totalQuantity: { $sum: '$quantity' },
        },
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product',
        },
      },
      { $unwind: '$product' },
      {
        $match: {
          $expr: { $lt: ['$totalQuantity', '$product.reorderLevel'] },
        },
      },
      {
        $project: {
          _id: '$product._id',
          name: '$product.name',
          sku: '$product.sku',
          totalQuantity: 1,
          reorderLevel: '$product.reorderLevel',
        },
      },
      { $sort: { totalQuantity: 1 } },
      { $limit: 20 },
    ]),

    // Recent movements (last 10)
    InventoryMovement.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('productId', 'name sku')
      .populate('fromLocation', 'rackCode')
      .populate('toLocation', 'rackCode')
      .populate('performedBy', 'name'),

    // Movement counts by type (last 30 days)
    InventoryMovement.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      { $group: { _id: '$type', count: { $sum: 1 } } },
    ]),
  ]);

  // Parse movement counts
  const movementCounts = { receipts: 0, deliveries: 0, transfers: 0, adjustments: 0 };
  for (const mc of movementCountsAgg) {
    switch (mc._id) {
      case 'RECEIPT':    movementCounts.receipts = mc.count; break;
      case 'DELIVERY':   movementCounts.deliveries = mc.count; break;
      case 'TRANSFER':   movementCounts.transfers = mc.count; break;
      case 'ADJUSTMENT': movementCounts.adjustments = mc.count; break;
    }
  }

  return {
    totalProducts,
    totalStockQuantity: stockAgg[0]?.total || 0,
    lowStockProducts,
    recentMovements,
    movementCounts,
  };
};

// ─── Inventory Health Score ──────────────────────────────────
export const getHealthScore = async (): Promise<HealthResult> => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [
    totalProducts,
    lowStockAgg,
    activeProductIds,
    totalLocations,
    overCapacityAgg,
  ] = await Promise.all([
    Product.countDocuments(),

    // Count products below reorder level
    Inventory.aggregate([
      { $group: { _id: '$productId', totalQty: { $sum: '$quantity' } } },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product',
        },
      },
      { $unwind: '$product' },
      { $match: { $expr: { $lt: ['$totalQty', '$product.reorderLevel'] } } },
      { $count: 'count' },
    ]),

    // Products with movements in last 30 days
    InventoryMovement.distinct('productId', {
      createdAt: { $gte: thirtyDaysAgo },
    }),

    Location.countDocuments(),

    // Locations where total quantity > capacity
    Inventory.aggregate([
      {
        $group: {
          _id: '$locationId',
          totalQty: { $sum: '$quantity' },
        },
      },
      {
        $lookup: {
          from: 'locations',
          localField: '_id',
          foreignField: '_id',
          as: 'location',
        },
      },
      { $unwind: '$location' },
      { $match: { $expr: { $gt: ['$totalQty', '$location.capacity'] } } },
      { $count: 'count' },
    ]),
  ]);

  const lowStockCount = lowStockAgg[0]?.count || 0;
  const deadStockCount = Math.max(0, totalProducts - activeProductIds.length);
  const overCapacityCount = overCapacityAgg[0]?.count || 0;

  return calculateHealthScore({
    totalProducts,
    lowStockCount,
    deadStockCount,
    totalLocations,
    overCapacityCount,
  });
};

// ─── Movement Trends ────────────────────────────────────────
export const getMovementTrends = async (days: number = 30) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const trends = await InventoryMovement.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: {
          date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          type: '$type',
        },
        count: { $sum: 1 },
        totalQuantity: { $sum: '$quantity' },
      },
    },
    { $sort: { '_id.date': 1 } },
    {
      $group: {
        _id: '$_id.date',
        movements: {
          $push: {
            type: '$_id.type',
            count: '$count',
            totalQuantity: '$totalQuantity',
          },
        },
        totalCount: { $sum: '$count' },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // Also return category breakdown
  const categoryBreakdown = await Inventory.aggregate([
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
      $group: {
        _id: '$product.category',
        totalQuantity: { $sum: '$quantity' },
        productCount: { $addToSet: '$productId' },
      },
    },
    {
      $project: {
        category: '$_id',
        totalQuantity: 1,
        productCount: { $size: '$productCount' },
      },
    },
    { $sort: { totalQuantity: -1 } },
  ]);

  return {
    days,
    trends,
    categoryBreakdown,
  };
};
