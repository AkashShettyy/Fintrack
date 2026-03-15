const Subscription = require("../models/Subscription");

// @route  POST /api/subscriptions
const addSubscription = async (req, res) => {
  try {
    const {
      name,
      amount,
      currency,
      category,
      billingCycle,
      renewalDate,
      status,
    } = req.body;

    const subscription = await Subscription.create({
      user: req.user._id,
      name,
      amount,
      currency,
      category,
      billingCycle,
      renewalDate,
      status,
    });

    res.status(201).json(subscription);
  } catch (error) {
    console.log("FULL ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

// @route  GET /api/subscriptions
const getSubscriptions = async (req, res) => {
  try {
    const subscriptions = await Subscription.find({ user: req.user._id }).sort({
      renewalDate: 1,
    });

    // Calculate totals
    const monthlyTotal = subscriptions
      .filter((s) => s.billingCycle === "monthly" && s.status === "active")
      .reduce((acc, s) => acc + s.amount, 0);

    const yearlyTotal = subscriptions
      .filter((s) => s.billingCycle === "yearly" && s.status === "active")
      .reduce((acc, s) => acc + s.amount, 0);

    res.json({
      subscriptions,
      summary: {
        monthlyTotal,
        yearlyTotal,
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
