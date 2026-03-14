import mongoose, { Document } from 'mongoose';
export interface IProduct extends Document {
    name: string;
    sku: string;
    category: string;
    unit: string;
    reorderLevel: number;
    description?: string;
    createdAt: Date;
    updatedAt: Date;
}
declare const Product: mongoose.Model<IProduct, {}, {}, {}, mongoose.Document<unknown, {}, IProduct, {}, mongoose.DefaultSchemaOptions> & IProduct & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IProduct>;
export default Product;
//# sourceMappingURL=Product.d.ts.map