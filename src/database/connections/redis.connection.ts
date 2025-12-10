import { Redis } from "ioredis";

const client = new Redis({
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD,
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT),
});

// Error handling
client.on("error", (err) => {
  console.error("ioredis Error", err);
});

client.on("connect", () => {
  console.log("ioredis Connected");
});

// Connect to Redis
export const connectRedis = async () => {
  try {
    await client.ping();
    console.log("Redis client connected successfully");
  } catch (error) {
    console.error("Failed to connect to Redis:", error);
    process.exit(1);
  }
};

process.on("SIGINT", async () => {
  await client.quit();
  console.log("Redis connection closed");
  process.exit(0);
});

export default client;
