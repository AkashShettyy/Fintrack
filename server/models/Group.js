const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
  {
    description: { type: String, required: true, trim: true },
    amount: { type: Number, required: true },
    paidBy: { type: String, required: true },
    splitBetween: [{ type: String }],
  },
  { timestamps: true },
);

const paymentSchema = new mongoose.Schema(
  {
    from: { type: String, required: true },
    to: { type: String, required: true },
    amount: { type: Number, required: true },
  },
  { timestamps: true },
);

const settlementSchema = new mongoose.Schema({
  from: { type: String },
  to: { type: String },
  amount: { type: Number },
  settled: { type: Boolean, default: false },
});

const groupSchema = new mongoose.Schema(
  {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    members: [
      {
        name: { type: String, required: true, trim: true },
        upiId: { type: String, default: "", trim: true },
      },
    ],
    expenses: [expenseSchema],
    payments: [paymentSchema],
    settlements: [settlementSchema],
  },
  { timestamps: true },
);

module.exports = mongoose.model("Group", groupSchema);
