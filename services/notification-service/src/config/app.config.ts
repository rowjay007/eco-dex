import { z } from 'zod';

const appConfigSchema = z.object({
  port: z.number().int().positive(),
  nodeEnv: z.enum(['development', 'production', 'test']),
  logLevel: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  kafka: z.object({
    brokers: z.array(z.string()),
    topics: z.object({
      notifications: z.string()
    })
  }),
  redis: z.object({
    url: z.string(),
    token: z.string()
  }),
  novu: z.object({
    apiKey: z.string().min(1),
    appIdentifier: z.string().min(1)
  }),
  email: z.object({
    host: z.string().optional(),
    port: z.number().int().positive().optional(),
    user: z.string().optional(),
    pass: z.string().optional()
  }).optional(),
  sms: z.object({
    accountSid: z.string().optional(),
    authToken: z.string().optional(),
    phoneNumber: z.string().optional()
  }).optional()
});

export type AppConfig = z.infer<typeof appConfigSchema>;

const getAppConfig = (): AppConfig => {
  const config = {
    port: parseInt(process.env.PORT || '3006', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    logLevel: process.env.LOG_LEVEL || 'info',
    kafka: {
      brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
      topics: {
        notifications: process.env.KAFKA_NOTIFICATIONS_TOPIC || 'notifications'
      }
    },
    redis: {
      url: process.env.UPSTASH_REDIS_REST_URL || '',
      token: process.env.UPSTASH_REDIS_REST_TOKEN || ''
    },
    novu: {
      apiKey: process.env.NOVU_API_KEY || '',
      appIdentifier: process.env.NOVU_APP_IDENTIFIER || ''
    },
    email: process.env.SMTP_HOST ? {
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    } : undefined,
    sms: process.env.TWILIO_ACCOUNT_SID ? {
      accountSid: process.env.TWILIO_ACCOUNT_SID,
      authToken: process.env.TWILIO_AUTH_TOKEN,
      phoneNumber: process.env.TWILIO_PHONE_NUMBER
    } : undefined
  };

  return appConfigSchema.parse(config);
};

export const appConfig = getAppConfig();