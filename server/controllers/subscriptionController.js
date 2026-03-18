const Subscription = require("../models/Subscription");

// @route  POST /api/subscriptions
const addSubscription = async (req, res) => {
  try {
    const { name, amount, currency, category, billingCycle, renewalDate, status, notes } = req.body;

    if (!name?.trim()) return res.status(400).json({ message: "Name is required" });
    if (!amount || Number(amount) <= 0) return res.status(400).json({ message: "Amount must be greater than 0" });
    if (!renewalDate) return res.status(400).json({ message: "Renewal date is required" });

    const subscription = await Subscription.create({
      user: req.user._id, name: name.trim(), amount: Number(amount),
      currency, category, billingCycle, renewalDate, status, notes: notes?.trim() || "",
    });
    res.status(201).json(subscription);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route  GET /api/subscriptions
const getSubscriptions = async (req, res) => {
  try {
    const subscriptions = await Subscription.find({ user: req.user._id }).sort({
      renewalDate: 1,
    });

    // Calculate totals — monthly includes annualized monthly subs
    const active = subscriptions.filter((s) => s.status === "active");
    const monthlyTotal = active
      .filter((s) => s.billingCycle === "monthly")
      .reduce((acc, s) => acc + s.amount, 0);
    const yearlyTotal = active
      .filter((s) => s.billingCycle === "yearly")
      .reduce((acc, s) => acc + s.amount, 0);
    const annualizedTotal = monthlyTotal * 12 + yearlyTotal;

    res.json({
      subscriptions,
      summary: {
        monthlyTotal,
        yearlyTotal,
        annualizedTotal,
        totalSubscriptions: subscriptions.length,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route  PUT /api/subscriptions/:id
const updateSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findById(req.params.id);

    if (!subscription) {
      return res.status(404).json({ message: "Subscription not found" });
    }

    // Make sure user owns this subscription
    if (subscription.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const updated = await Subscription.findByIdAndUpdate(
      req.params.id,
      req.body,
      { returnDocument: "after" },
    );

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route  DELETE /api/subscriptions/:id
const deleteSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findById(req.params.id);

    if (!subscription) {
      return res.status(404).json({ message: "Subscription not found" });
    }

    // Make sure user owns this subscription
    if (subscription.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized" });
    }

    await subscription.deleteOne();

    res.json({ message: "Subscription removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addSubscription,
  getSubscriptions,
  updateSubscription,
  deleteSubscription,
};
