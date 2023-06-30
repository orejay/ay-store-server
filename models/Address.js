import mongoose from "mongoose";

const AddressSchema = mongoose.Schema(
  {
    address: {
      type: String,
      min: 2,
      max: 150,
    },
    country: String,
    state: String,
    city: String,
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Address = mongoose.model("Address", AddressSchema);
export default Address;
