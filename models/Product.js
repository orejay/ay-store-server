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
    imageName: String,
    imagePath: String,
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
      required: true,
    },
    gender: {
      type: String,
      enum: ["men", "women", "unisex", "none"],
      default: "none",
    },
    brand: {
      type: String,
      default: "",
    },
    tags: {
      type: [String],
      default: [],
    },
    featured: {
      type: Boolean,
      default: false,
    },
    rating: {
      type: Number,
      default: 0,
    },
    supply: {
      type: Number,
      default: 0,
    },
    variants: [
      {
        size: { type: String, default: "" },
        color: { type: String, default: "" },
        stock: { type: Number, default: 0 },
      },
    ],
    images: { type: [String], default: [] },
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", ProductSchema);
export default Product;
