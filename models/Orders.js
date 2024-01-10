import mongoose from "mongoose";

const orderSchema = mongoose.Schema({
  product: { type: mongoose.Types.ObjectId, ref: "Product" },
  quantity: Number,
});

const OrdersSchema = mongoose.Schema(
  {
    userId: mongoose.Types.ObjectId,
    order: [orderSchema],
    price: String,
    address: { type: mongoose.Types.ObjectId, ref: "Address" },
    instructions: String,
    status: {
      type: String,
      enum: ["new", "processing", "shipped", "delivered", "completed"],
      default: "new",
    },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", OrdersSchema);
export default Order;
