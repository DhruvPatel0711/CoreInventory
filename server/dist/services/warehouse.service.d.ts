import mongoose from 'mongoose';
import { IWarehouse } from '../models/Warehouse';
export declare const getWarehouseLocations: (warehouseId: string) => Promise<{
    warehouse: mongoose.Document<unknown, {}, IWarehouse, {}, mongoose.DefaultSchemaOptions> & IWarehouse & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    };
    locations: any[];
}>;
export declare const listWarehouses: () => Promise<IWarehouse[]>;
//# sourceMappingURL=warehouse.service.d.ts.map