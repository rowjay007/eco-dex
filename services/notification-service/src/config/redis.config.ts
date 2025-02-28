import { Redis } from "@upstash/redis";
import { config } from "dotenv";

config({ path: ".env" });

if (!process.env.UPSTASH_REDIS_URL || !process.env.UPSTASH_REDIS_TOKEN) {
  throw new Error("UPSTASH_REDIS_URL and UPSTASH_REDIS_TOKEN are required");
}

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL,
  token: process.env.UPSTASH_REDIS_TOKEN,
});