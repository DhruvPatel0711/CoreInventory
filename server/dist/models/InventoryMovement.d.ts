import mongoose, { Document, Types } from 'mongoose';
export declare const MOVEMENT_TYPES: readonly ["RECEIPT", "DELIVERY", "TRANSFER", "ADJUSTMENT"];
export type MovementType = (typeof MOVEMENT_TYPES)[number];
export interface IInventoryMovement extends Document {
    productId: Types.ObjectId;
    type: MovementType;
    quantity: number;
    fromLocation: Types.ObjectId | null;
    toLocation: Types.ObjectId | null;
    reference?: string;
    notes?: string;
    performedBy: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
declare const InventoryMovement: mongoose.Model<IInventoryMovement, {}, {}, {}, mongoose.Document<unknown, {}, IInventoryMovement, {}, mongoose.DefaultSchemaOptions> & IInventoryMovement & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IInventoryMovement>;
export default InventoryMovement;
//# sourceMappingURL=InventoryMovement.d.ts.map