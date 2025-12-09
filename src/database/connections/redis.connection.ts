import { createClient } from "redis";
// Using connection URL
const client = createClient({
  url: process.env.REDIS_URL,
});

// Error handling
client.on("error", (err) => {
  console.error("Redis Client Error", err);
});

client.on("connect", () => {
  console.log("Connected to Redis");
});

let isConnected = false;
// Connect to Redis
export const connectRedis = async () => {
  try {
    if (!isConnected) {
      await client.connect();
      isConnected = true;
      console.log("Redis client connected successfully");
    }
  } catch (error) {
    console.error("Failed to connect to Redis:", error);
  }
};

process.on("SIGINT", async () => {
  await client.quit();
  console.log("Redis connection closed");
  process.exit(0);
});

export default client;

// Another way to connect redis
/*
import { createClient } from 'redis';

const client = createClient({
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT
    }
});

client.on('error', err => console.log('Redis Client Error', err));

await client.connect();

await client.set('foo', 'bar');
const result = await client.get('foo');
console.log(result)  // >>> bar

*/
