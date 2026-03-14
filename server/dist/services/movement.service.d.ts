import mongoose from 'mongoose';
interface BaseMovementInput {
    productId: string;
    quantity: number;
    reference?: string;
    notes?: string;
    performedBy: string;
}
export interface ReceiptInput extends BaseMovementInput {
    toLocationId: string;
}
export interface DeliveryInput extends BaseMovementInput {
    fromLocationId: string;
}
export interface TransferInput extends BaseMovementInput {
    fromLocationId: string;
    toLocationId: string;
}
export interface AdjustmentInput extends BaseMovementInput {
    locationId: string;
}
/**
 * RECEIPT — Goods arriving into a warehouse location.
 * Increases stock at toLocationId.
 */
export declare const receive: (input: ReceiptInput) => Promise<mongoose.Document<unknown, {}, import("../models/InventoryMovement").IInventoryMovement, {}, mongoose.DefaultSchemaOptions> & import("../models/InventoryMovement").IInventoryMovement & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}>;
/**
 * DELIVERY — Goods shipped out from a warehouse location.
 * Decreases stock at fromLocationId.
 */
export declare const deliver: (input: DeliveryInput) => Promise<mongoose.Document<unknown, {}, import("../models/InventoryMovement").IInventoryMovement, {}, mongoose.DefaultSchemaOptions> & import("../models/InventoryMovement").IInventoryMovement & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}>;
/**
 * TRANSFER — Move stock between two locations.
 * Decreases fromLocationId, increases toLocationId.
 */
export declare const transfer: (input: TransferInput) => Promise<mongoose.Document<unknown, {}, import("../models/InventoryMovement").IInventoryMovement, {}, mongoose.DefaultSchemaOptions> & import("../models/InventoryMovement").IInventoryMovement & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}>;
/**
 * ADJUSTMENT — Manual stock correction.
 * Positive quantity adds stock, negative removes stock.
 */
export declare const adjust: (input: AdjustmentInput) => Promise<mongoose.Document<unknown, {}, import("../models/InventoryMovement").IInventoryMovement, {}, mongoose.DefaultSchemaOptions> & import("../models/InventoryMovement").IInventoryMovement & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}>;
/**
 * Get movement history with optional filters.
 */
export declare const getMovements: (filters: {
    type?: string;
    productId?: string;
    page?: number;
    limit?: number;
}) => Promise<{
    data: (mongoose.Document<unknown, {}, import("../models/InventoryMovement").IInventoryMovement, {}, mongoose.DefaultSchemaOptions> & import("../models/InventoryMovement").IInventoryMovement & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[];
    total: number;
    page: number;
    pages: number;
}>;
export {};
//# sourceMappingURL=movement.service.d.ts.map