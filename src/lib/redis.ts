import { createClient } from "redis";

let redisClient: ReturnType<typeof createClient> | null = null;
let redisConnection: Promise<ReturnType<typeof createClient>> | null = null;

export async function getRedisClient() {
  const redisUrl = process.env.REDIS_URL;

  if (!redisUrl) {
    throw new Error("Falta la variable REDIS_URL");
  }

  if (!redisClient) {
    redisClient = createClient({ url: redisUrl });
    redisClient.on("error", (error) => {
      console.error("Redis client error:", error);
    });
  }

  if (redisClient.isOpen) {
    return redisClient;
  }

  if (!redisConnection) {
    redisConnection = redisClient.connect().then(() => redisClient!);
  }

  try {
    return await redisConnection;
  } catch (error) {
    redisConnection = null;
    throw error;
  }
}
