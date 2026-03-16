const cron = require("node-cron");
const Subscription = require("../models/Subscription");
const sendEmail = require("./sendEmail");
const { reminderEmail } = require("./emailTemplates");

const startReminderJob = () => {
  // Runs every day at 9AM
  cron.schedule("0 9 * * *", async () => {
    console.log("⏰ Running subscription reminder job...");

    try {
      const today = new Date();
      const threeDaysLater = new Date();
      threeDaysLater.setDate(today.getDate() + 3);

      // Find subscriptions renewing in 3 days
      const subscriptions = await Subscription.find({
        status: "active",
        reminderSent: false,
        renewalDate: {
          $gte: new Date(threeDaysLater.setHours(0, 0, 0, 0)),
          $lte: new Date(threeDaysLater.setHours(23, 59, 59, 999)),
        },
      }).populate("user", "name email");

      console.log(`📬 Found ${subscriptions.length} subscriptions to remind`);

      for (const sub of subscriptions) {
        try {
          await sendEmail({
            to: sub.user.email,
            subject: `⏰ ${sub.name} renews in 3 days - FinTrack`,
            html: reminderEmail(
              sub.user.name,
              sub.name,
              sub.amount,
              sub.renewalDate,
            ),
          });

          // Mark reminder as sent
          await Subscription.findByIdAndUpdate(sub._id, {
            reminderSent: true,
          });

          console.log(`✅ Reminder sent to ${sub.user.email} for ${sub.name}`);
        } catch (error) {
          console.error(
            `❌ Failed to send reminder for ${sub.name}:`,
            error.message,
          );
        }
      }
    } catch (error) {
      console.error("❌ Reminder job error:", error.message);
    }
  });

  console.log("✅ Reminder job scheduled - runs every day at 9AM");
};

module.exports = startReminderJob;
