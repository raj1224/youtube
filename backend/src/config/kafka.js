import { Kafka } from "kafkajs";

const kafka = new Kafka({
  clientId: process.env.KAFKA_CLIENT_ID,
  brokers: process.env.KAFKA_BROKERS.split(","),
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