"use strict";
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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
var bcrypt_1 = require("bcrypt");
// ─── Schema ──────────────────────────────────────────────────
var userSchema = new mongoose_1.Schema({
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
    resetPasswordOtp: {
        type: String,
    },
    resetPasswordOtpExpiry: {
        type: Date,
    },
}, {
    timestamps: true, // Adds createdAt & updatedAt automatically
});
// ─── Indexes ─────────────────────────────────────────────────
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ role: 1 });
// ─── Pre-save Hook: Hash password ───────────────────────────
userSchema.pre('save', function () {
    return __awaiter(this, void 0, void 0, function () {
        var salt, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!this.isModified('password'))
                        return [2 /*return*/];
                    return [4 /*yield*/, bcrypt_1.default.genSalt(12)];
                case 1:
                    salt = _b.sent();
                    _a = this;
                    return [4 /*yield*/, bcrypt_1.default.hash(this.password, salt)];
                case 2:
                    _a.password = _b.sent();
                    return [2 /*return*/];
            }
        });
    });
});
// ─── Instance Method: Compare password ──────────────────────
userSchema.methods.comparePassword = function (candidatePassword) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, bcrypt_1.default.compare(candidatePassword, this.password)];
        });
    });
};
// ─── Serialization: strip password from JSON ────────────────
userSchema.set('toJSON', {
    transform: function (_doc, ret) {
        var password = ret.password, __v = ret.__v, rest = __rest(ret, ["password", "__v"]);
        return rest;
    },
});
// ─── Export ──────────────────────────────────────────────────
var User = mongoose_1.default.model('User', userSchema);
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
