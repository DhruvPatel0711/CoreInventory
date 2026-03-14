import mongoose from 'mongoose';
import Warehouse, { IWarehouse } from '../models/Warehouse';
import Location from '../models/Location';
import { ApiError } from '../utils/ApiError';

// ─── Get Warehouse Locations Visualization ───────────────────
export const getWarehouseLocations = async (warehouseId: string) => {
  const warehouse = await Warehouse.findById(warehouseId);
  if (!warehouse) {
    throw new ApiError(404, 'Warehouse not found');
  }

  // Aggregate locations with current inventory quantities
  const locations = await Location.aggregate([
    { $match: { warehouseId: new mongoose.Types.ObjectId(warehouseId) } },
    {
      // Join with inventory to sum up stock in this location
      $lookup: {
        from: 'inventories', // Mongoose usually pluralizes 'Inventory' to 'inventories'
        localField: '_id',
        foreignField: 'locationId',
        as: 'inventory',
      },
    },
    {
      $addFields: {
        currentQuantity: { $sum: '$inventory.quantity' },
      },
    },
    {
      $addFields: {
        fillPercentage: {
          $cond: [
            { $gt: ['$capacity', 0] },
            { $multiply: [{ $divide: ['$currentQuantity', '$capacity'] }, 100] },
            0,
          ],
        },
      },
    },
    {
      $project: {
        _id: 1,
        rackCode: 1,
        capacity: 1,
        currentQuantity: 1,
        fillPercentage: { $round: ['$fillPercentage', 2] }, // round to 2 decimals
      },
    },
    { $sort: { rackCode: 1 } },
  ]);

  return {
    warehouse,
    locations,
  };
};

// ─── Basic CRUD (Optional helpers) ───────────────────────────
export const listWarehouses = async (): Promise<IWarehouse[]> => {
  return Warehouse.find().sort({ name: 1 });
};
