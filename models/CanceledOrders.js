import mongoose from "mongoose";

const orderSchema = mongoose.Schema({
  product: { type: mongoose.Types.ObjectId, ref: "Product" },
  quantity: Number,
});

const CanceledOrdersSchema = mongoose.Schema(
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

const CanceledOrder = mongoose.model("CanceledOrder", CanceledOrdersSchema);
export default CanceledOrder;
