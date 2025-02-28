import { Kafka, Consumer, Producer, KafkaConfig } from 'kafkajs';
import { z } from 'zod';

const kafkaConfigSchema = z.object({
  brokers: z.array(z.string()).min(1),
  clientId: z.string(),
  groupId: z.string(),
});

type KafkaEnvConfig = z.infer<typeof kafkaConfigSchema>;

const getKafkaConfig = (): KafkaEnvConfig => {
  const config = {
    brokers: (process.env.KAFKA_BROKERS || '').split(','),
    clientId: process.env.KAFKA_CLIENT_ID || 'notification-service',
    groupId: process.env.KAFKA_GROUP_ID || 'notification-service-group',
  };

  return kafkaConfigSchema.parse(config);
};

export class KafkaWrapper {
  private kafka: Kafka;
  private producer: Producer | null = null;
  private consumer: Consumer | null = null;

  constructor() {
    const config = getKafkaConfig();
    this.kafka = new Kafka({
      brokers: config.brokers,
      clientId: config.clientId,
    });
  }

  async connectProducer(): Promise<void> {
    try {
      this.producer = this.kafka.producer();
      await this.producer.connect();
    } catch (error) {
      console.error('Failed to connect to Kafka producer:', error);
      throw error;
    }
  }

  async connectConsumer(topics: string[]): Promise<void> {
    try {
      const config = getKafkaConfig();
      this.consumer = this.kafka.consumer({ groupId: config.groupId });
      await this.consumer.connect();
      await this.consumer.subscribe({ topics });
    } catch (error) {
      console.error('Failed to connect to Kafka consumer:', error);
      throw error;
    }
  }

  async disconnectProducer(): Promise<void> {
    if (this.producer) {
      await this.producer.disconnect();
      this.producer = null;
    }
  }

  async disconnectConsumer(): Promise<void> {
    if (this.consumer) {
      await this.consumer.disconnect();
      this.consumer = null;
    }
  }

  async sendMessage(topic: string, message: any): Promise<void> {
    if (!this.producer) {
      throw new Error('Producer not connected');
    }

    try {
      await this.producer.send({
        topic,
        messages: [{ value: JSON.stringify(message) }],
      });
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  }

  async consume(onMessage: (topic: string, message: any) => Promise<void>): Promise<void> {
    if (!this.consumer) {
      throw new Error('Consumer not connected');
    }

    try {
      await this.consumer.run({
        eachMessage: async ({ topic, message }) => {
          if (message.value) {
            const parsedMessage = JSON.parse(message.value.toString());
            await onMessage(topic, parsedMessage);
          }
        },
      });
    } catch (error) {
      console.error('Error in message consumption:', error);
      throw error;
    }
  }
}

export const kafkaWrapper = new KafkaWrapper();