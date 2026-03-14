"use strict";
// ─── Barrel Export: All Mongoose Models ──────────────────────
// Import this file instead of individual models for convenience.
//
// Usage:
//   import { User, Product, Inventory } from '../models';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MOVEMENT_TYPES = exports.InventoryMovement = exports.Inventory = exports.Location = exports.Warehouse = exports.Product = exports.User = void 0;
var User_1 = require("./User");
Object.defineProperty(exports, "User", { enumerable: true, get: function () { return __importDefault(User_1).default; } });
var Product_1 = require("./Product");
Object.defineProperty(exports, "Product", { enumerable: true, get: function () { return __importDefault(Product_1).default; } });
var Warehouse_1 = require("./Warehouse");
Object.defineProperty(exports, "Warehouse", { enumerable: true, get: function () { return __importDefault(Warehouse_1).default; } });
var Location_1 = require("./Location");
Object.defineProperty(exports, "Location", { enumerable: true, get: function () { return __importDefault(Location_1).default; } });
var Inventory_1 = require("./Inventory");
Object.defineProperty(exports, "Inventory", { enumerable: true, get: function () { return __importDefault(Inventory_1).default; } });
var InventoryMovement_1 = require("./InventoryMovement");
Object.defineProperty(exports, "InventoryMovement", { enumerable: true, get: function () { return __importDefault(InventoryMovement_1).default; } });
var InventoryMovement_2 = require("./InventoryMovement");
Object.defineProperty(exports, "MOVEMENT_TYPES", { enumerable: true, get: function () { return InventoryMovement_2.MOVEMENT_TYPES; } });
//# sourceMappingURL=index.js.map