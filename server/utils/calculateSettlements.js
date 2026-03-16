const calculateSettlements = (expenses, members, payments = []) => {
  const balances = {};

  // Init balances for all members
  members.forEach((member) => {
    balances[member.name] = 0;
  });

  // Calculate balances from expenses
  expenses.forEach((expense) => {
    const payers = Array.isArray(expense.paidBy) ? expense.paidBy : [expense.paidBy];
    const splitBetween = expense.splitBetween;
    const sharePerPayer = expense.amount / payers.length;
    const sharePerSplit = expense.amount / splitBetween.length;

    payers.forEach((payer) => {
      balances[payer] = (balances[payer] || 0) + sharePerPayer;
    });

    splitBetween.forEach((memberName) => {
      balances[memberName] = (balances[memberName] || 0) - sharePerSplit;
    });
  });

  // Subtract already paid amounts
  payments.forEach((payment) => {
    balances[payment.from] = (balances[payment.from] || 0) + payment.amount;
    balances[payment.to] = (balances[payment.to] || 0) - payment.amount;
  });

  const creditors = [];
  const debtors = [];

  Object.entries(balances).forEach(([name, balance]) => {
    if (balance > 0.01) creditors.push({ name, amount: balance });
    if (balance < -0.01) debtors.push({ name, amount: -balance });
  });

  const settlements = [];
  let i = 0;
  let j = 0;

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];
    const amount = Math.min(debtor.amount, creditor.amount);

    settlements.push({
      from: debtor.name,
      to: creditor.name,
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
