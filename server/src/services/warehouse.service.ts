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

export const createWarehouse = async (data: { name: string; location: string }): Promise<IWarehouse> => {
  const existing = await Warehouse.findOne({ name: data.name });
  if (existing) throw new ApiError(400, 'Warehouse with this name already exists');
  return Warehouse.create(data);
};

export const updateWarehouse = async (id: string, data: { name?: string; location?: string }): Promise<IWarehouse> => {
  const warehouse = await Warehouse.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!warehouse) throw new ApiError(404, 'Warehouse not found');
  return warehouse;
};

export const createRack = async (data: { warehouseId: string; rackCode: string; capacity: number }) => {
  const warehouse = await Warehouse.findById(data.warehouseId);
  if (!warehouse) throw new ApiError(404, 'Warehouse not found');
  
  const existing = await Location.findOne({ warehouseId: data.warehouseId, rackCode: data.rackCode });
  if (existing) throw new ApiError(400, `Rack ${data.rackCode} already exists in this warehouse`);
  
  return Location.create(data);
};
