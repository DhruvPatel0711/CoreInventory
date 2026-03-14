"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProduct = exports.updateProduct = exports.createProduct = exports.getProductBySku = exports.getProductById = exports.listProducts = void 0;
const Product_1 = __importDefault(require("../models/Product"));
const ApiError_1 = require("../utils/ApiError");
// ─── List Products (with filtering, search, pagination) ──────
const listProducts = async (options) => {
    const { category, search, sku, page = 1, limit = 20, sort = '-createdAt', } = options;
    // Build filter
    const filter = {};
    if (category) {
        filter.category = category;
    }
    if (sku) {
        // Support both exact and prefix search: "ELEC" matches "ELEC-KB-001"
        filter.sku = { $regex: `^${sku.toUpperCase()}`, $options: 'i' };
    }
    if (search) {
        // MongoDB text index search on name + description
        filter.$text = { $search: search };
    }
    // Pagination
    const pageNum = Math.max(1, page);
    const limitNum = Math.min(100, Math.max(1, limit));
    const skip = (pageNum - 1) * limitNum;
    // Build sort object from string ("-createdAt" → { createdAt: -1 })
    const sortObj = {};
    if (sort.startsWith('-')) {
        sortObj[sort.slice(1)] = -1;
    }
    else {
        sortObj[sort] = 1;
    }
    const [data, total] = await Promise.all([
        Product_1.default.find(filter).sort(sortObj).skip(skip).limit(limitNum),
        Product_1.default.countDocuments(filter),
    ]);
    return {
        data,
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
    };
};
exports.listProducts = listProducts;
// ─── Get Product by ID ───────────────────────────────────────
const getProductById = async (id) => {
    const product = await Product_1.default.findById(id);
    if (!product) {
        throw new ApiError_1.ApiError(404, 'Product not found');
    }
    return product;
};
exports.getProductById = getProductById;
// ─── Get Product by SKU ──────────────────────────────────────
const getProductBySku = async (sku) => {
    const product = await Product_1.default.findOne({ sku: sku.toUpperCase() });
    if (!product) {
        throw new ApiError_1.ApiError(404, `Product with SKU '${sku.toUpperCase()}' not found`);
    }
    return product;
};
exports.getProductBySku = getProductBySku;
// ─── Create Product ──────────────────────────────────────────
const createProduct = async (data) => {
    // Check for duplicate SKU
    const existing = await Product_1.default.findOne({ sku: data.sku.toUpperCase() });
    if (existing) {
        throw new ApiError_1.ApiError(409, `Product with SKU '${data.sku.toUpperCase()}' already exists`);
    }
    const product = await Product_1.default.create(data);
    return product;
};
exports.createProduct = createProduct;
// ─── Update Product ──────────────────────────────────────────
const updateProduct = async (id, data) => {
    // If updating SKU, check for duplicates
    if (data.sku) {
        const existing = await Product_1.default.findOne({
            sku: data.sku.toUpperCase(),
            _id: { $ne: id },
        });
        if (existing) {
            throw new ApiError_1.ApiError(409, `SKU '${data.sku.toUpperCase()}' is already in use`);
        }
    }
    const product = await Product_1.default.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true,
    });
    if (!product) {
        throw new ApiError_1.ApiError(404, 'Product not found');
    }
    return product;
};
exports.updateProduct = updateProduct;
// ─── Delete Product ──────────────────────────────────────────
const deleteProduct = async (id) => {
    const product = await Product_1.default.findByIdAndDelete(id);
    if (!product) {
        throw new ApiError_1.ApiError(404, 'Product not found');
    }
    return product;
};
exports.deleteProduct = deleteProduct;
//# sourceMappingURL=product.service.js.map