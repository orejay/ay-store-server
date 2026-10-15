import mongoose from "mongoose";

const DeliveryZoneSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    areas: [{ type: String }],
    extraChargeAboveKg: { type: Number, default: 5 },
    extraChargeNote: { type: String, default: "" },
  },
  { timestamps: true }
);

const DeliveryZone = mongoose.model("DeliveryZone", DeliveryZoneSchema);
export default DeliveryZone;
