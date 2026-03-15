const Group = require("../models/Group");
const calculateSettlements = require("../utils/calculateSettlements");

// @route  POST /api/groups
const createGroup = async (req, res) => {
  try {
    const { name, description, members } = req.body;

    // members is an array of names ["Akash", "Raj", "Priya"]
    const memberList = members.map((m) => ({ name: m }));

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
const getSettlements = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    const settlements = calculateSettlements(group.expenses, group.members);
    res.json(settlements);
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
