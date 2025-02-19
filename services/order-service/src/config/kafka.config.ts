import { Kafka, Producer, Consumer } from "kafkajs";
import { env } from "./app.config";
import logger from "@/utils/logger";


export const kafka = new Kafka({
  clientId: env.SERVICE_NAME,
  brokers: env.KAFKA_BROKERS.split(","),
});

export const producer: Producer = kafka.producer();
export const consumer: Consumer = kafka.consumer({
  groupId: env.KAFKA_GROUP_ID,
});

export const connectKafka = async () => {
  try {
    await producer.connect();
    await consumer.connect();
    logger.info("Successfully connected to Kafka");
  } catch (error) {
    logger.error("Failed to connect to Kafka:", error);
    throw error;
  }
};

export const disconnectKafka = async () => {
  try {
    await producer.disconnect();
    await consumer.disconnect();
    logger.info("Successfully disconnected from Kafka");
  } catch (error) {
    logger.error("Failed to disconnect from Kafka:", error);
    throw error;
  }
};