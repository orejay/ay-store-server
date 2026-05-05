import mongoose from "mongoose";

const orderSchema = mongoose.Schema({
  product: { type: mongoose.Types.ObjectId, ref: "Product" },
  quantity: Number,
  variantId: { type: mongoose.Types.ObjectId, default: null },
});

const OrdersSchema = mongoose.Schema(
  {
    userId: mongoose.Types.ObjectId,
    order: [orderSchema],
    price: String,
    discountAmount: { type: Number, default: 0 },
    couponCode: { type: String, default: null },
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
