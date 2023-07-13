import mongoose from "mongoose";

const OrdersSchema = mongoose.Schema({
  userId: mongoose.Types.ObjectId,
  order: [
    {
      productId: mongoose.Types.ObjectId,
      quantity: Number,
    },
  ],
  address: String,
  instructions: String,
  status: {
    type: String,
    enum: ["new", "processing", "shipped", "delivered", "completed"],
    default: "new",
  },
});

const Order = mongoose.model("Order", OrdersSchema);
export default Order;
