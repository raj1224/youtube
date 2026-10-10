import { Kafka } from "kafkajs";

import { env } from "./env.js";

const kafka = new Kafka({
  clientId: env.KAFKA_CLIENT_ID,
  brokers: env.KAFKA_BROKERS.split(",").map((broker) => broker.trim()),
});

export const producer = kafka.producer();

export const connectKafka = async () => {
  await producer.connect();

  console.log("🟣 Kafka producer connected");
};

export const disconnectKafka = async () => {
  await producer.disconnect();

  console.log("Kafka producer disconnected.");
};

export default kafka;