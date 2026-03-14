import mongoose, { Document, Types } from 'mongoose';
export interface ILocation extends Document {
    warehouseId: Types.ObjectId;
    rackCode: string;
    capacity: number;
    createdAt: Date;
    updatedAt: Date;
}
declare const Location: mongoose.Model<ILocation, {}, {}, {}, mongoose.Document<unknown, {}, ILocation, {}, mongoose.DefaultSchemaOptions> & ILocation & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, ILocation>;
export default Location;
//# sourceMappingURL=Location.d.ts.map