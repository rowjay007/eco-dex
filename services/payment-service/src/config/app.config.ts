import { config } from 'dotenv';
import { z } from 'zod';

// Load environment variables
config();

// Define the environment schema
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3005'),
  DB_HOST: z.string(),
  DB_PORT: z.string().default('5432'),
  DB_USER: z.string(),
  DB_PASSWORD: z.string(),
  DB_NAME: z.string(),
  KAFKA_BROKERS: z.string().optional(),
  PAYSTACK_SECRET_KEY: z.string(),
  PAYSTACK_PUBLIC_KEY: z.string(),
  FLUTTERWAVE_SECRET_KEY: z.string(),
  FLUTTERWAVE_PUBLIC_KEY: z.string(),
  WEBHOOK_SECRET: z.string()
});

// Parse and validate environment variables
const env = envSchema.parse(process.env);

// Export configuration object
export const appConfig = {
  env: env.NODE_ENV,
  port: parseInt(env.PORT, 10),
  db: {
    host: env.DB_HOST,
    port: parseInt(env.DB_PORT, 10),
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME
  },
  kafka: {
    brokers: env.KAFKA_BROKERS?.split(',') || []
  },
  paystack: {
    secretKey: env.PAYSTACK_SECRET_KEY,
    publicKey: env.PAYSTACK_PUBLIC_KEY
  },
  flutterwave: {
    secretKey: env.FLUTTERWAVE_SECRET_KEY,
    publicKey: env.FLUTTERWAVE_PUBLIC_KEY
  },
  webhook: {
    secret: env.WEBHOOK_SECRET
  }
};