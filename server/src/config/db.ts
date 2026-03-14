import mongoose from 'mongoose';
import { env } from './env';

// ─── Connect to MongoDB ──────────────────────────────────────
export const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(env.MONGO_URI);
    console.log(`✅  MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.error('❌  MongoDB connection failed:', error);
    process.exit(1);
  }
};

// ─── Graceful Shutdown ───────────────────────────────────────
export const disconnectDB = async (): Promise<void> => {
  await mongoose.disconnect();
  console.log('🔌  MongoDB disconnected');
};