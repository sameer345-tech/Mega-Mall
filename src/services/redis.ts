import dotenv from "dotenv";
dotenv.config();

import { Redis } from "ioredis";

const redis = new Redis({
  host: process.env.REDIS_HOST!,
  port: Number(process.env.REDIS_PORT!),
  password: process.env.REDIS_PASSWORD!,
  maxRetriesPerRequest: null, // Required for BullMQ
  lazyConnect: true,
});

// Test Redis connection
redis.on('connect', () => {
  console.log('🔗 Connected to Redis');
});

redis.on('error', (err) => {
  console.error('❌ Redis connection error:', err);
});

redis.on('ready', () => {
  console.log('✅ Redis is ready');
});

export default redis;