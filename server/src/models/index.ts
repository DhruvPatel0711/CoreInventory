// ─── Barrel Export: All Mongoose Models ──────────────────────
// Import this file instead of individual models for convenience.
//
// Usage:
//   import { User, Product, Inventory } from '../models';

export { default as User } from './User';
export { default as Product } from './Product';
export { default as Warehouse } from './Warehouse';
export { default as Location } from './Location';
export { default as Inventory } from './Inventory';
export { default as InventoryMovement } from './InventoryMovement';

// Re-export useful types & constants
export type { IUser } from './User';
export type { IProduct } from './Product';
export type { IWarehouse } from './Warehouse';
export type { ILocation } from './Location';
export type { IInventory } from './Inventory';
export type { IInventoryMovement, MovementType } from './InventoryMovement';
export { MOVEMENT_TYPES } from './InventoryMovement';
