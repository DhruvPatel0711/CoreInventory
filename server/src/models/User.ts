import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcrypt';

// ─── Interface ───────────────────────────────────────────────
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'manager' | 'staff';
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// ─── Schema ──────────────────────────────────────────────────
const userSchema = new Schema<IUser>(
  {
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
  },
  {
    timestamps: true, // Adds createdAt & updatedAt automatically
  }
);

// ─── Indexes ─────────────────────────────────────────────────
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ role: 1 });

// ─── Pre-save Hook: Hash password ───────────────────────────
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// ─── Instance Method: Compare password ──────────────────────
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// ─── Serialization: strip password from JSON ────────────────
userSchema.set('toJSON', {
  transform(_doc, ret) {
    const { password, __v, ...rest } = ret;
    return rest;
  },
});

// ─── Export ──────────────────────────────────────────────────
const User = mongoose.model<IUser>('User', userSchema);
export default User;

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
