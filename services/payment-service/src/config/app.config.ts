import { z } from 'zod';
import * as dotenv from 'dotenv';

dotenv.config();

export type NodeEnv = 'development' | 'production' | 'test';

export const isDevelopment = (env: NodeEnv): env is 'development' => env === 'development';
export const isProduction = (env: NodeEnv): env is 'production' => env === 'production';
export const isTest = (env: NodeEnv): env is 'test' => env === 'test';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test'] as const).default('development'),
  PORT: z.string().transform(Number).default('3005'),
  SERVICE_NAME: z.string().default('payment-service'),
  LOG_LEVEL: z.string().default('info'),
  DATABASE_URL: z.string(),
  UPSTASH_REDIS_REST_URL: z.string(),
  UPSTASH_REDIS_REST_TOKEN: z.string(),
  PAYSTACK_SECRET_KEY: z.string(),
  PAYSTACK_PUBLIC_KEY: z.string(),
  FLUTTERWAVE_SECRET_KEY: z.string(),
  FLUTTERWAVE_PUBLIC_KEY: z.string(),
});

export const config = envSchema.parse(process.env);

export type Config = z.infer<typeof envSchema>;
