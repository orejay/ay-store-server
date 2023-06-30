import mongoose from "mongoose";

const TransactionSchema = new mongoose.Schema(
  {
    userId: mongoose.Types.ObjectId,
    cost: Number,
    product: {
      type: [mongoose.Types.ObjectId],
      of: Number,
    },
  },
  { timestamps: true }
);

const Transaction = mongoose.model("Transaction", TransactionSchema);
export default Transaction;
