const Subscription = require("../models/Subscription");

const ALLOWED_SUBSCRIPTION_FIELDS = [
  "name",
  "amount",
  "currency",
  "category",
  "billingCycle",
  "renewalDate",
  "status",
  "notes",
];

const buildSubscriptionPayload = (body) =>
  ALLOWED_SUBSCRIPTION_FIELDS.reduce((payload, field) => {
    if (body[field] === undefined) return payload;

    if (field === "name" || field === "notes" || field === "currency") {
      payload[field] = body[field]?.trim?.() || "";
      return payload;
    }

    if (field === "amount") {
      payload[field] = Number(body[field]);
      return payload;
    }

    payload[field] = body[field];
    return payload;
  }, {});

const validateSubscriptionPayload = (payload, { requireFields = false } = {}) => {
  if (requireFields || payload.name !== undefined) {
    if (!payload.name) return "Name is required";
  }

  if (requireFields || payload.amount !== undefined) {
    if (!Number.isFinite(payload.amount) || payload.amount <= 0) return "Amount must be greater than 0";
  }

  if (requireFields || payload.renewalDate !== undefined) {
    if (!payload.renewalDate) return "Renewal date is required";
    if (Number.isNaN(new Date(payload.renewalDate).getTime())) return "Renewal date must be valid";
  }

  return null;
};

const sendSubscriptionError = (res, error) => {
  if (error.name === "ValidationError") {
    return res.status(400).json({ message: error.message });
  }

  return res.status(500).json({ message: error.message });
};

// @route  POST /api/subscriptions
const addSubscription = async (req, res) => {
  try {
    const payload = buildSubscriptionPayload(req.body);
    const validationError = validateSubscriptionPayload(payload, { requireFields: true });

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const subscription = await Subscription.create({
      user: req.user._id,
      ...payload,
    });
    res.status(201).json(subscription);
  } catch (error) {
    sendSubscriptionError(res, error);
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
    sendSubscriptionError(res, error);
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

    const payload = buildSubscriptionPayload(req.body);
    const validationError = validateSubscriptionPayload(payload);

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    if (!Object.keys(payload).length) {
      return res.status(400).json({ message: "No valid subscription fields provided" });
    }

    const updated = await Subscription.findByIdAndUpdate(
      req.params.id,
      payload,
      { returnDocument: "after", runValidators: true },
    );

    res.json(updated);
  } catch (error) {
    sendSubscriptionError(res, error);
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
