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
});

const Order = mongoose.model("Order", OrdersSchema);
export default Order;
