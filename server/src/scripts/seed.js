"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
var dotenv_1 = require("dotenv");
var User_1 = require("../models/User");
var Warehouse_1 = require("../models/Warehouse");
var Location_1 = require("../models/Location");
var Product_1 = require("../models/Product");
var InventoryNode_1 = require("../models/InventoryNode");
var Receipt_1 = require("../models/Receipt");
var Delivery_1 = require("../models/Delivery");
var Transfer_1 = require("../models/Transfer");
var Adjustment_1 = require("../models/Adjustment");
dotenv_1.default.config();
var MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/coreinventory';
// Helpers
var randomInt = function (min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; };
var randomElement = function (arr) { return arr[Math.floor(Math.random() * arr.length)]; };
var randomDate = function (start, end) { return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())); };
// Data Pools
var CATEGORIES = ['Electronics', 'Mechanical', 'Hardware', 'Packaging', 'Chemicals', 'Food', 'Textiles', 'Automotive', 'Medical Supplies', 'Office Equipment'];
var UNITS = ['pcs', 'boxes', 'kg', 'liters', 'pallets', 'rolls'];
var WAREHOUSE_NAMES = ['Mumbai Central Repo', 'Delhi Hub', 'Bengaluru South Node', 'Chennai Port Warehouse', 'Hyderabad Tech Zone'];
var SUPPLIERS = ['Acme Corp', 'Global Logistics', 'FastTech Industries', 'Prime Materials', 'Apex Components', 'Zenith Suppliers', 'Nova Distribution', 'Vertex Solutions'];
var CUSTOMERS = ['TechCorp Solutions', 'Omega Manufacturing', 'Alpha Assembly', 'Beta Builders', 'Gamma Generators', 'Delta Delivery Services'];
var ADJUSTMENT_REASONS = ['Damaged in transit', 'Expired stock', 'Miscounted during audit', 'Quality check failure', 'Theft', 'Found in wrong rack'];
function generateSeedData() {
    return __awaiter(this, void 0, void 0, function () {
        var adminExists, warehouses, locations, _i, WAREHOUSE_NAMES_1, wName, warehouse, rows, _a, rows_1, row, i, insertedLocations, products, i, category, insertedProducts, inventoryMap, adminUser, now, threeMonthsAgo, receipts, deliveries, transfers, adjustments, _b, insertedProducts_1, prod, spreadCount, i, loc, qty, key, eventDate, activeNodes, i, nodeKeyVal, key, node, consumeQty, eventDate, i, nodeKeyVal, key, node, adjustQty, eventDate, i, nodeKeyVal, key, fromNode, toLoc, xferQty, eventDate, toKey, invDocs, error_1;
        var _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    console.log('🌱 Starting CoreInventory Massive Seed Process...');
                    _e.label = 1;
                case 1:
                    _e.trys.push([1, 19, , 20]);
                    return [4 /*yield*/, mongoose_1.default.connect(MONGO_URI)];
                case 2:
                    _e.sent();
                    console.log('✅ Connected to MongoDB');
                    // 1. CLEAR DATABASE
                    console.log('🧹 Clearing existing data...');
                    return [4 /*yield*/, Promise.all([
                            Warehouse_1.default.deleteMany({}), Location_1.default.deleteMany({}), Product_1.default.deleteMany({}),
                            InventoryNode_1.default.deleteMany({}), Receipt_1.default.deleteMany({}), Delivery_1.default.deleteMany({}),
                            Transfer_1.default.deleteMany({}), Adjustment_1.default.deleteMany({})
                        ])];
                case 3:
                    _e.sent();
                    return [4 /*yield*/, User_1.default.findOne({ email: 'admin@coreinventory.com' })];
                case 4:
                    adminExists = _e.sent();
                    if (!!adminExists) return [3 /*break*/, 6];
                    return [4 /*yield*/, User_1.default.create({
                            name: 'System Admin',
                            email: 'admin@coreinventory.com',
                            password: 'password123',
                            role: 'admin'
                        })];
                case 5:
                    _e.sent();
                    console.log('✅ Default Admin User created');
                    _e.label = 6;
                case 6:
                    // 2. CREATE WAREHOUSES & LOCATIONS (RACKS)
                    console.log("\uD83C\uDFED Generating ".concat(WAREHOUSE_NAMES.length, " Warehouses & Racks..."));
                    warehouses = [];
                    locations = [];
                    _i = 0, WAREHOUSE_NAMES_1 = WAREHOUSE_NAMES;
                    _e.label = 7;
                case 7:
                    if (!(_i < WAREHOUSE_NAMES_1.length)) return [3 /*break*/, 10];
                    wName = WAREHOUSE_NAMES_1[_i];
                    return [4 /*yield*/, Warehouse_1.default.create({
                            name: wName,
                            location: "".concat(wName.split(' ')[0], " Industrial Area")
                        })];
                case 8:
                    warehouse = _e.sent();
                    warehouses.push(warehouse);
                    rows = ['A', 'B', 'C', 'D', 'E'];
                    for (_a = 0, rows_1 = rows; _a < rows_1.length; _a++) {
                        row = rows_1[_a];
                        for (i = 1; i <= 10; i++) {
                            locations.push({
                                warehouseId: warehouse._id,
                                rackCode: "".concat(row).concat(i),
                                capacity: randomInt(500, 5000)
                            });
                        }
                    }
                    _e.label = 9;
                case 9:
                    _i++;
                    return [3 /*break*/, 7];
                case 10: return [4 /*yield*/, Location_1.default.insertMany(locations)];
                case 11:
                    insertedLocations = _e.sent();
                    // 3. CREATE 200+ PRODUCTS
                    console.log('📦 Generating 250 Products...');
                    products = [];
                    for (i = 1; i <= 250; i++) {
                        category = randomElement(CATEGORIES);
                        products.push({
                            name: "".concat(category, " Component ").concat(i),
                            sku: "".concat(category.substring(0, 3).toUpperCase(), "-").concat(String(i).padStart(4, '0')),
                            category: category,
                            description: "High quality industrial grade ".concat(category, " component suitable for heavy usage."),
                            unit: randomElement(UNITS),
                            reorderLevel: randomInt(50, 500),
                        });
                    }
                    return [4 /*yield*/, Product_1.default.insertMany(products)];
                case 12:
                    insertedProducts = _e.sent();
                    // 4. GENERATE INVENTORY NODES & HISTORY
                    console.log('📈 Simulating Inventory Levels & 1000+ Movement History Logs...');
                    inventoryMap = new Map();
                    return [4 /*yield*/, User_1.default.findOne({ email: 'admin@coreinventory.com' })];
                case 13:
                    adminUser = _e.sent();
                    now = new Date();
                    threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                    receipts = [];
                    deliveries = [];
                    transfers = [];
                    adjustments = [];
                    // Spread base stock randomly
                    for (_b = 0, insertedProducts_1 = insertedProducts; _b < insertedProducts_1.length; _b++) {
                        prod = insertedProducts_1[_b];
                        spreadCount = randomInt(5, 15);
                        for (i = 0; i < spreadCount; i++) {
                            loc = randomElement(insertedLocations);
                            qty = randomInt(100, 1000);
                            key = "".concat(prod._id, "|").concat(loc._id);
                            eventDate = randomDate(threeMonthsAgo, new Date());
                            // Add receipt history
                            receipts.push({
                                productId: prod._id,
                                toLocation: loc._id,
                                quantity: qty,
                                reference: "PO-".concat(randomInt(10000, 99999)),
                                supplier: randomElement(SUPPLIERS),
                                status: 'COMPLETED',
                                receivedBy: adminUser === null || adminUser === void 0 ? void 0 : adminUser._id,
                                createdAt: eventDate,
                                updatedAt: eventDate
                            });
                            // Update map
                            inventoryMap.set(key, {
                                productId: prod._id,
                                warehouseId: loc.warehouseId,
                                locationId: loc._id,
                                quantity: (((_c = inventoryMap.get(key)) === null || _c === void 0 ? void 0 : _c.quantity) || 0) + qty,
                                lastUpdated: eventDate
                            });
                        }
                    }
                    activeNodes = Array.from(inventoryMap.entries());
                    // 500 random deliveries
                    for (i = 0; i < 500; i++) {
                        nodeKeyVal = randomElement(activeNodes);
                        key = nodeKeyVal[0], node = nodeKeyVal[1];
                        if (node.quantity > 50) {
                            consumeQty = randomInt(10, 40);
                            eventDate = randomDate(node.lastUpdated, new Date());
                            deliveries.push({
                                productId: node.productId,
                                fromLocation: node.locationId,
                                quantity: consumeQty,
                                reference: "SO-".concat(randomInt(10000, 99999)),
                                customer: randomElement(CUSTOMERS),
                                status: 'SHIPPED',
                                dispatchedBy: adminUser === null || adminUser === void 0 ? void 0 : adminUser._id,
                                createdAt: eventDate,
                                updatedAt: eventDate
                            });
                            node.quantity -= consumeQty;
                        }
                    }
                    // 200 random adjustments
                    for (i = 0; i < 200; i++) {
                        nodeKeyVal = randomElement(activeNodes);
                        key = nodeKeyVal[0], node = nodeKeyVal[1];
                        adjustQty = randomInt(1, 15);
                        if (node.quantity > adjustQty) {
                            eventDate = randomDate(node.lastUpdated, new Date());
                            adjustments.push({
                                productId: node.productId,
                                fromLocation: node.locationId,
                                quantity: adjustQty,
                                type: 'DECREASE',
                                reason: 'DAMAGE',
                                notes: randomElement(ADJUSTMENT_REASONS),
                                adjustedBy: adminUser === null || adminUser === void 0 ? void 0 : adminUser._id,
                                createdAt: eventDate,
                                updatedAt: eventDate
                            });
                            node.quantity -= adjustQty;
                        }
                    }
                    // 300 random transfers
                    for (i = 0; i < 300; i++) {
                        nodeKeyVal = randomElement(activeNodes);
                        key = nodeKeyVal[0], fromNode = nodeKeyVal[1];
                        if (fromNode.quantity > 30) {
                            toLoc = randomElement(insertedLocations);
                            if (toLoc._id !== fromNode.locationId) {
                                xferQty = randomInt(10, 25);
                                eventDate = randomDate(fromNode.lastUpdated, new Date());
                                transfers.push({
                                    productId: fromNode.productId,
                                    fromLocation: fromNode.locationId,
                                    toLocation: toLoc._id,
                                    quantity: xferQty,
                                    status: 'COMPLETED',
                                    requestedBy: adminUser === null || adminUser === void 0 ? void 0 : adminUser._id,
                                    createdAt: eventDate,
                                    updatedAt: eventDate
                                });
                                fromNode.quantity -= xferQty;
                                toKey = "".concat(fromNode.productId, "|").concat(toLoc._id);
                                inventoryMap.set(toKey, {
                                    productId: fromNode.productId,
                                    warehouseId: toLoc.warehouseId,
                                    locationId: toLoc._id,
                                    quantity: (((_d = inventoryMap.get(toKey)) === null || _d === void 0 ? void 0 : _d.quantity) || 0) + xferQty,
                                    lastUpdated: eventDate
                                });
                            }
                        }
                    }
                    // Insert Final Inventory State
                    console.log("Writing ".concat(inventoryMap.size, " final inventory states..."));
                    invDocs = Array.from(inventoryMap.values()).filter(function (v) { return v.quantity > 0; }).map(function (v) { return (__assign(__assign({}, v), { updatedAt: v.lastUpdated })); });
                    return [4 /*yield*/, InventoryNode_1.default.insertMany(invDocs)];
                case 14:
                    _e.sent();
                    // Insert Histories
                    console.log("Writing ".concat(receipts.length, " Receipts..."));
                    return [4 /*yield*/, Receipt_1.default.insertMany(receipts)];
                case 15:
                    _e.sent();
                    console.log("Writing ".concat(deliveries.length, " Deliveries..."));
                    return [4 /*yield*/, Delivery_1.default.insertMany(deliveries)];
                case 16:
                    _e.sent();
                    console.log("Writing ".concat(transfers.length, " Transfers..."));
                    return [4 /*yield*/, Transfer_1.default.insertMany(transfers)];
                case 17:
                    _e.sent();
                    console.log("Writing ".concat(adjustments.length, " Adjustments..."));
                    return [4 /*yield*/, Adjustment_1.default.insertMany(adjustments)];
                case 18:
                    _e.sent();
                    console.log('✅ SEEDING COMPLETE! You now have a massive dataset.');
                    process.exit(0);
                    return [3 /*break*/, 20];
                case 19:
                    error_1 = _e.sent();
                    console.error('❌ SEED ERROR:', error_1);
                    process.exit(1);
                    return [3 /*break*/, 20];
                case 20: return [2 /*return*/];
            }
        });
    });
}
generateSeedData();
