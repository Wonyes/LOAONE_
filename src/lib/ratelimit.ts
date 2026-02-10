import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Vercel KV 연결
const redis = Redis.fromEnv();

// 1. 일반적인 API 제한 (분당 20회)
export const generalRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, "1 m"),
  analytics: true,
  prefix: "ratelimit_general",
});

// 2. 무거운 작업 (쇼케이스 등록 등) 제한 (분당 3회)
export const strictRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, "1 m"),
  analytics: true,
  prefix: "ratelimit_strict",
});
