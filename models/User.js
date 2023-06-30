import mongoose from "mongoose";

const UserSchema = mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      min: 2,
      max: 15,
    },
    lastName: {
      type: String,
      required: true,
      min: 2,
      max: 15,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      max: 25,
    },
    password: {
      type: String,
      required: true,
      min: 5,
    },
    phoneNumber: String,
    avatar: {
      data: Buffer,
      contentType: String,
    },
    transactions: {
      type: [mongoose.Types.ObjectId],
      ref: "Transaction",
    },
    role: {
      type: String,
      enum: ["user", "admin", "superadmin"],
      default: "user",
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", UserSchema);
export default User;
