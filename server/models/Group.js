const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
    },
    paidBy: {
      type: String,
      required: true,
    },
    splitBetween: [
      {
        type: String,
      },
    ],
  },
  { timestamps: true },
);

const groupSchema = new mongoose.Schema(
  {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: [true, "Group name is required"],
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    members: [
      {
        name: {
          type: String,
          required: true,
          trim: true,
        },
      },
    ],
    expenses: [expenseSchema],
  },
  { timestamps: true },
);

module.exports = mongoose.model("Group", groupSchema);
