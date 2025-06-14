import { Queue } from "bullmq";
import redis from "../services/redis.js";

export const emailQueue = new Queue("email-queue", {
  connection: redis
});
