const Group = require("../models/Group");
const calculateSettlements = require("../utils/calculateSettlements");

const getOwnedGroup = async (id, userId) => {
  const group = await Group.findById(id);
  if (!group) return { error: { status: 404, message: "Group not found" } };
  if (group.createdBy.toString() !== userId.toString()) {
    return { error: { status: 401, message: "Not authorized" } };
  }
  return { group };
};

// @route  POST /api/groups
const createGroup = async (req, res) => {
  try {
    const { name, description, members } = req.body;
    if (!name?.trim()) return res.status(400).json({ message: "Group name is required" });

    const memberList = Array.isArray(members)
      ? members
          .filter((member) => member?.name?.trim())
          .map((member) => ({ name: member.name.trim(), upiId: member.upiId?.trim() || "" }))
      : [];
    if (memberList.length === 0) return res.status(400).json({ message: "At least one member is required" });

    const memberNames = memberList.map((member) => member.name.toLowerCase());
    if (new Set(memberNames).size !== memberNames.length) {
      return res.status(400).json({ message: "Member names must be unique" });
    }

    const group = await Group.create({ name: name.trim(), description, createdBy: req.user._id, members: memberList });
    res.status(201).json(group);
  } catch (error) {
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
    const { group, error } = await getOwnedGroup(req.params.id, req.user._id);
    if (error) return res.status(error.status).json({ message: error.message });

    res.json(group);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route  DELETE /api/groups/:id
const deleteGroup = async (req, res) => {
  try {
    const { group, error } = await getOwnedGroup(req.params.id, req.user._id);
    if (error) return res.status(error.status).json({ message: error.message });

    await group.deleteOne();
    res.json({ message: "Group deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route  POST /api/groups/:id/expenses
const addExpense = async (req, res) => {
  try {
    const { group, error } = await getOwnedGroup(req.params.id, req.user._id);
    if (error) return res.status(error.status).json({ message: error.message });

    const { description, amount, paidBy, splitBetween } = req.body;
    const numericAmount = Number(amount);
    if (!description?.trim()) return res.status(400).json({ message: "Description is required" });
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) return res.status(400).json({ message: "Amount must be greater than 0" });
    if (!Array.isArray(paidBy) || !paidBy.length) return res.status(400).json({ message: "At least one payer required" });
    if (!Array.isArray(splitBetween) || !splitBetween.length) return res.status(400).json({ message: "Split between cannot be empty" });

    const memberNames = new Set(group.members.map((member) => member.name));
    const hasUnknownMember = [...paidBy, ...splitBetween].some((name) => !memberNames.has(name));
    if (hasUnknownMember) return res.status(400).json({ message: "Expense members must belong to the group" });

    group.expenses.push({ description: description.trim(), amount: numericAmount, paidBy, splitBetween });
    await group.save();
    res.status(201).json(group);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route  DELETE /api/groups/:id/expenses/:eid
const deleteExpense = async (req, res) => {
  try {
    const { group, error } = await getOwnedGroup(req.params.id, req.user._id);
    if (error) return res.status(error.status).json({ message: error.message });

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
    const { group, error } = await getOwnedGroup(req.params.id, req.user._id);
    if (error) return res.status(error.status).json({ message: error.message });

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
    const numericAmount = Number(amount);
    const { group, error } = await getOwnedGroup(req.params.id, req.user._id);
    if (error) return res.status(error.status).json({ message: error.message });

    const memberNames = new Set(group.members.map((member) => member.name));
    if (!memberNames.has(from) || !memberNames.has(to)) {
      return res.status(400).json({ message: "Settlement members must belong to the group" });
    }

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({ message: "Settlement amount must be greater than 0" });
    }

    // Record the payment
    group.payments.push({ from, to, amount: numericAmount });
    await group.save();

    res.json({ message: "Payment recorded successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route  GET /api/groups/:id/balances
const getBalances = async (req, res) => {
  try {
    const { group, error } = await getOwnedGroup(req.params.id, req.user._id);
    if (error) return res.status(error.status).json({ message: error.message });

    const balances = {};
    group.members.forEach((m) => { balances[m.name] = 0; });

    group.expenses.forEach((expense) => {
      const payers = Array.isArray(expense.paidBy) ? expense.paidBy : [expense.paidBy];
      const sharePerPayer = expense.amount / payers.length;
      const sharePerSplit = expense.amount / expense.splitBetween.length;
      payers.forEach((p) => { balances[p] = (balances[p] || 0) + sharePerPayer; });
      expense.splitBetween.forEach((m) => { balances[m] = (balances[m] || 0) - sharePerSplit; });
    });

    group.payments.forEach((p) => {
      balances[p.from] = (balances[p.from] || 0) + p.amount;
      balances[p.to] = (balances[p.to] || 0) - p.amount;
    });

    const result = Object.entries(balances).map(([name, balance]) => ({
      name,
      balance: Math.round(balance * 100) / 100,
      status: balance > 0.01 ? "owed" : balance < -0.01 ? "owes" : "settled",
    }));

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createGroup, getGroups, getGroup, deleteGroup,
  addExpense, deleteExpense, getSettlements, markSettled, getBalances,
};
