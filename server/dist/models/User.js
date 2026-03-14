"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const bcrypt_1 = __importDefault(require("bcrypt"));
// ─── Schema ──────────────────────────────────────────────────
const userSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        minlength: [2, 'Name must be at least 2 characters'],
        maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters'],
        select: false, // Exclude from queries by default
    },
    role: {
        type: String,
        enum: {
            values: ['admin', 'manager', 'staff'],
            message: 'Role must be admin, manager, or staff',
        },
        default: 'staff',
    },
}, {
    timestamps: true, // Adds createdAt & updatedAt automatically
});
// ─── Indexes ─────────────────────────────────────────────────
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ role: 1 });
// ─── Pre-save Hook: Hash password ───────────────────────────
userSchema.pre('save', async function () {
    if (!this.isModified('password'))
        return;
    const salt = await bcrypt_1.default.genSalt(12);
    this.password = await bcrypt_1.default.hash(this.password, salt);
});
// ─── Instance Method: Compare password ──────────────────────
userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt_1.default.compare(candidatePassword, this.password);
};
// ─── Serialization: strip password from JSON ────────────────
userSchema.set('toJSON', {
    transform(_doc, ret) {
        const { password, __v, ...rest } = ret;
        return rest;
    },
});
// ─── Export ──────────────────────────────────────────────────
const User = mongoose_1.default.model('User', userSchema);
exports.default = User;
/*
┌─────────────────────────────────────────────────────────┐
│  EXAMPLE DOCUMENT                                       │
├─────────────────────────────────────────────────────────┤
│  {                                                      │
│    "_id": "665a1b2c3d4e5f6a7b8c9d0e",                  │
│    "name": "Dhruv Sharma",                              │
│    "email": "dhruv@coreinventory.com",                  │
│    "password": "$2b$12$X8k...hashedValue",              │
│    "role": "admin",                                     │
│    "createdAt": "2026-03-14T04:00:00.000Z",             │
│    "updatedAt": "2026-03-14T04:00:00.000Z"              │
│  }                                                      │
└─────────────────────────────────────────────────────────┘
*/
//# sourceMappingURL=User.js.map