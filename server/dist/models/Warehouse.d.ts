import mongoose, { Document } from 'mongoose';
export interface IWarehouse extends Document {
    name: string;
    location: string;
    createdAt: Date;
    updatedAt: Date;
}
declare const Warehouse: mongoose.Model<IWarehouse, {}, {}, {}, mongoose.Document<unknown, {}, IWarehouse, {}, mongoose.DefaultSchemaOptions> & IWarehouse & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IWarehouse>;
export default Warehouse;
//# sourceMappingURL=Warehouse.d.ts.map