import { Worker } from "bullmq";
import { emailVerification, orderStatusUpdate, cancelOrder, placedOrder } from "../services/resend.js";
import redis from "../services/redis.js";

const emailWorker = new Worker("email-queue", async (job) => {
  const { type, payload } = job.data;

  try {
    switch (type) {
      case "verify-email":
        // console.log("📧 Processing email verification");
        const emailResponse = await emailVerification(payload.userName, payload.email, payload.otp);
        // console.log("📧 Email verification response:", emailResponse);
        break;

      case "order-placed":
        // console.log("📧 Processing order placed email");
        await placedOrder(payload.userName, payload.email, payload.message, payload.orderId);
        break;

      case "order-status-update":
        // console.log("📧 Processing order status update email");
        await orderStatusUpdate(payload.userName, payload.email, payload.message, payload.orderId);
        break;

      case "order-cancel":
        // console.log("📧 Processing order cancel email");
        await cancelOrder(payload.userName, payload.email, payload.message, payload.orderId);
        break;

      default:
        console.log("❌ Unknown email type:", type);
        throw new Error(`Unknown email type: ${type}`);
    }
  } catch (error) {
    console.error(`❌ Error processing email job:`, error);
    throw error; // Re-throw to mark job as failed
  }
}, {
  connection: redis,
});

emailWorker.on("completed", (job) => {
  console.log(`✅ Email job [${job.id}] completed successfully`);
});

emailWorker.on("failed", (job, err) => {
  console.error(`❌ Email job [${job?.id}] failed:`, err.message);
});

emailWorker.on("error", (err) => {
  console.error("❌ Email worker error:", err);
});

// console.log("📧 Email worker started and listening for jobs...");

export default emailWorker;
