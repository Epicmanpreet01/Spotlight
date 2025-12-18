import cron from "node-cron";
import { closeExpiredGigs } from "./closeExpiredGigs.job.js";

// Runs every hour
cron.schedule("0 * * * *", async () => {
  await closeExpiredGigs();
});
