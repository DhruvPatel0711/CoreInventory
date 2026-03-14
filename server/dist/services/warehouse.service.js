"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listWarehouses = exports.getWarehouseLocations = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Warehouse_1 = __importDefault(require("../models/Warehouse"));
const Location_1 = __importDefault(require("../models/Location"));
const ApiError_1 = require("../utils/ApiError");
// ─── Get Warehouse Locations Visualization ───────────────────
const getWarehouseLocations = async (warehouseId) => {
    const warehouse = await Warehouse_1.default.findById(warehouseId);
    if (!warehouse) {
        throw new ApiError_1.ApiError(404, 'Warehouse not found');
    }
    // Aggregate locations with current inventory quantities
    const locations = await Location_1.default.aggregate([
        { $match: { warehouseId: new mongoose_1.default.Types.ObjectId(warehouseId) } },
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
exports.getWarehouseLocations = getWarehouseLocations;
// ─── Basic CRUD (Optional helpers) ───────────────────────────
const listWarehouses = async () => {
    return Warehouse_1.default.find().sort({ name: 1 });
};
exports.listWarehouses = listWarehouses;
//# sourceMappingURL=warehouse.service.js.map