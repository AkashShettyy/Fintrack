const Group = require("../models/Group");
const User = require("../models/User");
const calculateSettlements = require("../utils/calculateSettlements");

// @route  POST /api/groups
const createGroup = async (req, res) => {
  try {
    const { name, description, memberEmails } = req.body;

    // Find members by email
    const members = await User.find({ email: { $in: memberEmails } });
    const memberIds = members.map((m) => m._id);

    // Always include creator
    if (!memberIds.includes(req.user._id)) {
      memberIds.push(req.user._id);
    }

    const group = await Group.create({
      name,
      description,
      createdBy: req.user._id,
      members: memberIds,
    });

    await group.populate("members", "name email");

    res.status(201).json(group);
  } catch (error) {
    console.log("FULL ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

// @route  GET /api/groups
const getGroups = async (req, res) => {
  try {
    const groups = await Group.find({ members: req.user._id })
      .populate("members", "name email")
      .populate("expenses.paidBy", "name email")
      .sort({ createdAt: -1 });

    res.json(groups);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route  GET /api/groups/:id
const getGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate("members", "name email")
      .populate("expenses.paidBy", "name email")
      .populate("expenses.splitBetween", "name email");

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Check if user is a member
    if (
      !group.members.some((m) => m._id.toString() === req.user._id.toString())
    ) {
      return res.status(401).json({ message: "Not authorized" });
    }

    res.json(group);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route  DELETE /api/groups/:id
const deleteGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    if (group.createdBy.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized" });
    }

    await group.deleteOne();
    res.json({ message: "Group deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route  POST /api/groups/:id/expenses
const addExpense = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    const { description, amount, paidByEmail, splitBetweenEmails } = req.body;

    // Find users by email
    const paidByUser = await User.findOne({ email: paidByEmail });
    if (!paidByUser) {
      return res.status(404).json({ message: "Paid by user not found" });
    }

    const splitUsers = await User.find({ email: { $in: splitBetweenEmails } });
    const splitIds = splitUsers.map((u) => u._id);

    group.expenses.push({
      description,
      amount,
      paidBy: paidByUser._id,
      splitBetween: splitIds,
    });

    await group.save();
    await group.populate("expenses.paidBy", "name email");
    await group.populate("expenses.splitBetween", "name email");

    res.status(201).json(group);
  } catch (error) {
    console.log("FULL ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};
// @route  DELETE /api/groups/:id/expenses/:eid
const deleteExpense = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    group.expenses = group.expenses.filter(
      (e) => e._id.toString() !== req.params.eid,
    );

    await group.save();
    res.json({ message: "Expense deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route  GET /api/groups/:id/settlements
const getSettlements = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate("members", "name email")
      .populate("expenses.paidBy", "name email")
      .populate("expenses.splitBetween", "name email");

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    const settlements = calculateSettlements(group.expenses, group.members);

    // Replace IDs with user details
    const enriched = settlements.map((s) => {
      const fromUser = group.members.find(
        (m) => m._id.toString() === s.from.toString(),
      );
      const toUser = group.members.find(
        (m) => m._id.toString() === s.to.toString(),
      );

      return {
        from: fromUser
          ? { name: fromUser.name, email: fromUser.email }
          : s.from,
        to: toUser ? { name: toUser.name, email: toUser.email } : s.to,
        amount: s.amount,
      };
    });

    res.json(enriched);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createGroup,
  getGroups,
  getGroup,
  deleteGroup,
  addExpense,
  deleteExpense,
  getSettlements,
};
