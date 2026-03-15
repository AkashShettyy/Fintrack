const Group = require("../models/Group");
const calculateSettlements = require("../utils/calculateSettlements");

// @route  POST /api/groups
const createGroup = async (req, res) => {
  try {
    const { name, description, members } = req.body;

    const memberList = Array.isArray(members)
      ? members
          .filter((member) => member?.name?.trim())
          .map((member) => ({
            name: member.name.trim(),
            upiId: member.upiId?.trim() || "",
          }))
      : [];

    const group = await Group.create({
      name,
      description,
      createdBy: req.user._id,
      members: memberList,
    });

    res.status(201).json(group);
  } catch (error) {
    console.log("FULL ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

// @route  GET /api/groups
const getGroups = async (req, res) => {
  try {
    const groups = await Group.find({ createdBy: req.user._id }).sort({
      createdAt: -1,
    });
    res.json(groups);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route  GET /api/groups/:id
const getGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    if (group.createdBy.toString() !== req.user._id.toString()) {
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

    const { description, amount, paidBy, splitBetween } = req.body;

    group.expenses.push({
      description,
      amount,
      paidBy,
      splitBetween,
    });

    await group.save();
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
// @route  GET /api/groups/:id/settlements
const getSettlements = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Calculate settlements considering already paid amounts
    const calculated = calculateSettlements(
      group.expenses,
      group.members,
      group.payments,
    );

    // Attach UPI ID of the "to" member
    const enriched = calculated.map((s) => {
      const toMember = group.members.find((m) => m.name === s.to);
      return {
        ...s,
        upiId: toMember?.upiId || "",
      };
    });

    res.json(enriched);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route  PUT /api/groups/:id/settlements/settle
const markSettled = async (req, res) => {
  try {
    const { from, to, amount } = req.body;
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Record the payment
    group.payments.push({ from, to, amount });
    await group.save();

    res.json({ message: "Payment recorded successfully" });
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
  markSettled,
};
