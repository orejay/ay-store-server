import mongoose from "mongoose";

const ProductSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    image: {
      data: Buffer,
      contentType: String,
    },
    discount: {
      type: Number,
      default: 0,
    },
    description: {
      type: String,
      default: "",
    },
    category: {
      type: String,
      enum: ["skin", "face", "lips", "perfumery", "household", "decorative"],
      required: true,
    },
    rating: {
      type: Number,
      default: 0,
    },
    supply: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", ProductSchema);
export default Product;
