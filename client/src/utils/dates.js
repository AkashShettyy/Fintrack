export const daysUntil = (dateStr) => {
  if (!dateStr) return null;

  const targetDate = new Date(dateStr);
  if (Number.isNaN(targetDate.getTime())) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  targetDate.setHours(0, 0, 0, 0);

  return Math.round((targetDate - today) / (1000 * 60 * 60 * 24));
};
