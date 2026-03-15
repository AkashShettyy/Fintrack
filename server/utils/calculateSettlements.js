const calculateSettlements = (expenses, members) => {
  // Track balance for each member
  const balances = {};

  members.forEach((memberId) => {
    balances[memberId.toString()] = 0;
  });

  // Calculate balances
  expenses.forEach((expense) => {
    const paidBy = expense.paidBy.toString();
    const splitBetween = expense.splitBetween.map((m) => m.toString());
    const shareAmount = expense.amount / splitBetween.length;

    // Person who paid gets credited
    balances[paidBy] = (balances[paidBy] || 0) + expense.amount;

    // Each person who owes gets debited
    splitBetween.forEach((memberId) => {
      balances[memberId] = (balances[memberId] || 0) - shareAmount;
    });
  });

  // Convert balances to settlements
  const settlements = [];
  const creditors = [];
  const debtors = [];

  Object.entries(balances).forEach(([memberId, balance]) => {
    if (balance > 0.01) creditors.push({ memberId, amount: balance });
    if (balance < -0.01) debtors.push({ memberId, amount: -balance });
  });

  // Match debtors to creditors
  let i = 0;
  let j = 0;

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];
    const amount = Math.min(debtor.amount, creditor.amount);

    settlements.push({
      from: debtor.memberId,
      to: creditor.memberId,
      amount: Math.round(amount * 100) / 100,
    });

    debtor.amount -= amount;
    creditor.amount -= amount;

    if (debtor.amount < 0.01) i++;
    if (creditor.amount < 0.01) j++;
  }

  return settlements;
};

module.exports = calculateSettlements;
