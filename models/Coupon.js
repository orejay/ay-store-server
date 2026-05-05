import mongoose from "mongoose";

const CouponSchema = mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true },
    discountPercent: { type: Number, required: true, min: 1, max: 100 },
    active: { type: Boolean, default: true },
    expiresAt: { type: Date },
  },
  { timestamps: true }
);

const Coupon = mongoose.model("Coupon", CouponSchema);
export default Coupon;
