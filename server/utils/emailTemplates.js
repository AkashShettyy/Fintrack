const reminderEmail = (userName, subscriptionName, amount, renewalDate) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1f2937; color: #fff; padding: 32px; border-radius: 16px;">
      <h1 style="color: #818cf8; margin-bottom: 8px;">FinTrack 💸</h1>
      <h2 style="color: #fff; margin-bottom: 24px;">Subscription Renewal Reminder</h2>
      
      <p style="color: #9ca3af;">Hey ${userName},</p>
      <p style="color: #9ca3af;">Your <strong style="color: #fff">${subscriptionName}</strong> subscription is renewing in <strong style="color: #818cf8;">3 days</strong>.</p>

      <div style="background: #374151; padding: 20px; border-radius: 12px; margin: 24px 0;">
        <p style="margin: 0; color: #9ca3af;">Subscription</p>
        <p style="margin: 4px 0 16px; color: #fff; font-size: 20px; font-weight: bold;">${subscriptionName}</p>
        <p style="margin: 0; color: #9ca3af;">Amount</p>
        <p style="margin: 4px 0 16px; color: #818cf8; font-size: 24px; font-weight: bold;">₹${amount}</p>
        <p style="margin: 0; color: #9ca3af;">Renewal Date</p>
        <p style="margin: 4px 0 0; color: #fff; font-weight: bold;">${new Date(renewalDate).toLocaleDateString()}</p>
      </div>

      <p style="color: #9ca3af;">If you want to cancel, make sure to do it before the renewal date.</p>
      <p style="color: #6b7280; font-size: 12px; margin-top: 32px;">This is an automated reminder from FinTrack.</p>
    </div>
  `;
};

module.exports = { reminderEmail };
