import mongoose, { Document, Types } from 'mongoose';
export interface IInventory extends Document {
    productId: Types.ObjectId;
    locationId: Types.ObjectId;
    quantity: number;
    createdAt: Date;
    updatedAt: Date;
}
declare const Inventory: mongoose.Model<IInventory, {}, {}, {}, mongoose.Document<unknown, {}, IInventory, {}, mongoose.DefaultSchemaOptions> & IInventory & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IInventory>;
export default Inventory;
//# sourceMappingURL=Inventory.d.ts.map