import mongoose from "mongoose";

const PaystackPaymentsSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    orderId: {
      type: mongoose.Types.ObjectId,
      ref: "Order",
    },
    paymentRef: String,
  },
  { timestamps: true }
);

const PaystackPayments = mongoose.model(
  "PaystackPayment",
  PaystackPaymentsSchema
);

export default PaystackPayments;
