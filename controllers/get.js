import Product from "../models/Product.js";
import User from "../models/User.js";
import ProductStat from "../models/ProductStat.js";
import { StatusCodes } from "http-status-codes";
import Address from "../models/Address.js";
import Order from "../models/Orders.js";
import Wishlist from "../models/Wishlist.js";
import Coupon from "../models/Coupon.js";
import axios from "axios";

export const veryPaystack = async (req, res) => {
  try {
    const ref = req.params.ref;
    const secretKey = process.env.PAYSTACK_SECRET;

    const url = `https://api.paystack.co/transaction/verify/${ref}`;
    const authorization = `Bearer ${secretKey}`;

    try {
      const response = await axios.get(url, {
        headers: {
          Authorization: authorization,
        },
      });

      console.log(response.data);
      return res.status(StatusCodes.OK).json({ data: response.data });
    } catch (error) {
      console.error(error);
    }
  } catch (error) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const { id } = req.user;
    const status = req.params.status;

    const user = await User.findOne({ _id: id });

    if (!["admin", "superadmin"].includes(user.role))
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: "Unauthorized to perform this action" });

    const orders = await Order.find({ status: status })
      .populate("address")
      .populate("order.product");

    return res.status(StatusCodes.OK).json(orders);
  } catch (error) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
  }
};

export const getOrders = async (req, res) => {
  try {
    const { id } = req.user;
    const orders = await Order.find({
      userId: id,
    })
      .populate("address")
      .populate("order.product");

    return res.status(StatusCodes.OK).json(orders);
  } catch (error) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
  }
};

export const getAddresses = async (req, res) => {
  try {
    const { id } = req.user;
    const addresses = await Address.find({
      user: id,
    });

    return res.status(StatusCodes.OK).json(addresses);
  } catch (error) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
  }
};

export const getDefaultAddress = async (req, res) => {
  try {
    const userId = req.params.id;
    const addresses = await Address.find({
      user: userId,
      isDefault: true,
    });

    return res.status(StatusCodes.OK).json(addresses);
  } catch (error) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
  }
};

export const getAddress = async (req, res) => {
  try {
    const userId = req.params.id;
    const addresses = await Address.find({ user: userId });

    return res.status(StatusCodes.OK).json(addresses);
  } catch (error) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
  }
};

export const searchProducts = async (req, res) => {
  try {
    const { name } = req.query;
    const filter = {};

    if (name) filter.name = { $regex: name, $options: "i" };
    const products = await Product.find(filter, { name: 1 });

    return res
      .status(StatusCodes.OK)
      .json({ products, total: products.length });
  } catch (error) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
  }
};

export const getProducts = async (req, res) => {
  try {
    const { category, priceRange, discount, rating, gender, brand, tags, sort } =
      req.query;
    const filter = {};

    if (category) {
      const categories = category.split(",");
      filter.category = { $in: categories };
    }
    if (discount === "true") filter.discount = { $gte: 1 };
    if (priceRange) {
      const [minPrice, maxPrice] = priceRange.split("-");
      filter.price = { $gte: minPrice, $lte: maxPrice };
    }
    if (rating) {
      const [minRating, maxRating] = rating.split("-");
      filter.rating = { $gte: minRating, $lte: maxRating };
    }
    if (gender && gender !== "all") filter.gender = gender;
    if (brand) filter.brand = { $regex: brand, $options: "i" };
    if (tags) {
      const tagList = tags.split(",").map((t) => t.trim()).filter(Boolean);
      if (tagList.length) filter.tags = { $in: tagList };
    }

    const sortMap = {
      price_asc: { price: 1 },
      price_desc: { price: -1 },
      newest: { createdAt: -1 },
      top_rated: { rating: -1 },
    };
    const sortOption = sortMap[sort] || { createdAt: -1 };

    const products = await Product.find(filter).sort(sortOption);

    return res
      .status(StatusCodes.OK)
      .json({ products, total: products.length });
  } catch (error) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
  }
};

export const getProductsByCategory = async (req, res) => {
  try {
    const category = req.params.category;
    const products = await Product.find({ category: category });

    return res
      .status(StatusCodes.OK)
      .json({ products, total: products.length });
  } catch (error) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
  }
};

export const getFeaturedProducts = async (req, res) => {
  try {
    const products = await Product.find({ featured: true });
    return res
      .status(StatusCodes.OK)
      .json({ products, total: products.length });
  } catch (error) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
  }
};

export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product)
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Product not found" });
    return res.status(StatusCodes.OK).json(product);
  } catch (error) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
  }
};

export const getWishlist = async (req, res) => {
  try {
    const { id } = req.user;
    const wishlist = await Wishlist.findOne({ userId: id }).populate("productIds");
    return res.status(StatusCodes.OK).json({ products: wishlist?.productIds || [] });
  } catch (error) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
  }
};

export const validateCoupon = async (req, res) => {
  try {
    const code = req.params.code.toUpperCase();
    const coupon = await Coupon.findOne({ code, active: true });
    if (!coupon)
      return res.status(StatusCodes.NOT_FOUND).json({ message: "Coupon not found or inactive." });
    if (coupon.expiresAt && coupon.expiresAt < new Date())
      return res.status(StatusCodes.GONE).json({ message: "Coupon has expired." });
    return res.status(StatusCodes.OK).json({ code: coupon.code, discountPercent: coupon.discountPercent });
  } catch (error) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
  }
};

export const getCoupons = async (req, res) => {
  try {
    const { id } = req.user;
    const user = await User.findById(id);
    if (!["admin", "superadmin"].includes(user.role))
      return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Unauthorized." });
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    return res.status(StatusCodes.OK).json(coupons);
  } catch (error) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
  }
};

export const getUsers = async (req, res) => {
  try {
    const { id } = req.user;

    const user = await User.findOne({ _id: id });

    if (!["admin", "superadmin"].includes(user.role))
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: "Unauthorized to perform this action" });

    const users = await User.find().select("-password");

    return res.status(StatusCodes.OK).json(users);
  } catch (error) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
  }
};
