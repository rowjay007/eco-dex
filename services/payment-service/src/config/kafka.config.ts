import { Kafka, logLevel } from 'kafkajs';
import { config } from './app.config';

export const kafka = new Kafka({
  clientId: `${config.SERVICE_NAME}-${config.NODE_ENV}`,
  brokers: ['localhost:9092'],
  logLevel: logLevel.INFO,
});

export const producer = kafka.producer();
export const consumer = kafka.consumer({ 
  groupId: `${config.SERVICE_NAME}-group-${config.NODE_ENV}` 
});


export const PAYMENT_TOPICS = {
  PAYMENT_CREATED: 'payment.created',
  PAYMENT_COMPLETED: 'payment.completed',
  PAYMENT_FAILED: 'payment.failed',
  REFUND_INITIATED: 'refund.initiated',
  REFUND_COMPLETED: 'refund.completed',
} as const;
