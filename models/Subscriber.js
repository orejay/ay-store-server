import mongoose from "mongoose";

const SubscriberSchema = mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Subscriber = mongoose.model("Subscriber", SubscriberSchema);
export default Subscriber;
