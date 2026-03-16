const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const subscriptionRoutes = require("./routes/subscriptionRoutes");
const groupRoutes = require("./routes/groupRoutes");
const startReminderJob = require("./utils/reminderJob");

// Load env variables FIRST
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors({ origin: "*", credentials: false }));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/groups", groupRoutes);

app.get("/test-email", async (req, res) => {
  const sendEmail = require("./utils/sendEmail");
  const { reminderEmail } = require("./utils/emailTemplates");
  try {
    await sendEmail({
      to: process.env.EMAIL_USER,
      subject: "Test Email from FinTrack 💸",
      html: reminderEmail("Akash", "Netflix", 649, new Date()),
    });
    res.json({ message: "Email sent! ✅ Check your inbox" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/", (req, res) => {
  res.json({ message: "FinTrack API is running 🚀" });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  // Start reminder job AFTER server starts
  startReminderJob();
});
