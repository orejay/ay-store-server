import Product from "../models/Product.js";
import User from "../models/User.js";
import ProductStat from "../models/ProductStat.js";
import { StatusCodes } from "http-status-codes";
import Address from "../models/Address.js";
import Order from "../models/Orders.js";
import Wishlist from "../models/Wishlist.js";
import Coupon from "../models/Coupon.js";
import Message from "../models/Message.js";
import Review from "../models/Review.js";
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
    const { page = 1, limit = 20, from, to } = req.query;

    const user = await User.findOne({ _id: id });
    if (!["admin", "superadmin"].includes(user.role))
      return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Unauthorized to perform this action" });

    const filter = status === "all" ? {} : { status };

    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) {
        const end = new Date(to);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate("address")
        .populate("order.product")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Order.countDocuments(filter),
    ]);

    return res.status(StatusCodes.OK).json({
      orders,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
    });
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
    const { name, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (name) filter.name = { $regex: name, $options: "i" };

    const skip = (Number(page) - 1) * Number(limit);
    const [products, total] = await Promise.all([
      Product.find(filter).skip(skip).limit(Number(limit)),
      Product.countDocuments(filter),
    ]);

    return res.status(StatusCodes.OK).json({
      products,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
    });
  } catch (error) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
  }
};

export const getProducts = async (req, res) => {
  try {
    const {
      category, priceRange, discount, rating, gender, brand, tags, sort,
      page = 1, limit = 20,
    } = req.query;
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

    const skip = (Number(page) - 1) * Number(limit);
    const [products, total] = await Promise.all([
      Product.find(filter).sort(sortOption).skip(skip).limit(Number(limit)),
      Product.countDocuments(filter),
    ]);

    return res.status(StatusCodes.OK).json({
      products,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
    });
  } catch (error) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
  }
};

export const getProductsByCategory = async (req, res) => {
  try {
    const category = req.params.category;
    const { page = 1, limit = 20 } = req.query;
    const filter = { category };

    const skip = (Number(page) - 1) * Number(limit);
    const [products, total] = await Promise.all([
      Product.find(filter).skip(skip).limit(Number(limit)),
      Product.countDocuments(filter),
    ]);

    return res.status(StatusCodes.OK).json({
      products,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
    });
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

export const getDashboardStats = async (req, res) => {
  try {
    const { id } = req.user;
    const user = await User.findById(id);
    if (!["admin", "superadmin"].includes(user.role))
      return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Unauthorized." });

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Orders by status
    const statusCounts = await Order.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);
    const ordersByStatus = { new: 0, processing: 0, shipped: 0, delivered: 0, completed: 0 };
    statusCounts.forEach(({ _id, count }) => { if (_id in ordersByStatus) ordersByStatus[_id] = count; });

    // Total revenue from completed/delivered orders (price stored as string on order)
    const allOrders = await Order.find({ status: { $in: ["completed", "delivered"] } }).select("price createdAt");
    const totalRevenue = allOrders.reduce((sum, o) => sum + (parseFloat(o.price) || 0), 0);
    const revenueThisMonth = allOrders
      .filter((o) => new Date(o.createdAt) >= startOfMonth)
      .reduce((sum, o) => sum + (parseFloat(o.price) || 0), 0);

    // Top-selling products
    const topProducts = await Order.aggregate([
      { $unwind: "$order" },
      { $group: { _id: "$order.product", totalSold: { $sum: "$order.quantity" } } },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
      { $lookup: { from: "products", localField: "_id", foreignField: "_id", as: "product" } },
      { $unwind: "$product" },
      { $project: { _id: 0, name: "$product.name", totalSold: 1, price: "$product.price", category: "$product.category" } },
    ]);

    // User counts
    const totalUsers = await User.countDocuments({ role: "user" });
    const newUsersThisMonth = await User.countDocuments({ role: "user", createdAt: { $gte: startOfMonth } });

    // Low-stock products
    const lowStockProducts = await Product.find({ supply: { $lt: 10 } })
      .sort({ supply: 1 })
      .limit(8)
      .select("name supply category price");

    // Recent orders
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(6)
      .populate("order.product", "name price discount")
      .populate("address", "city state")
      .select("status price createdAt order address");

    return res.status(StatusCodes.OK).json({
      revenue: { total: totalRevenue, thisMonth: revenueThisMonth },
      ordersByStatus,
      topProducts,
      totalUsers,
      newUsersThisMonth,
      lowStockProducts,
      recentOrders,
    });
  } catch (error) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
  }
};

export const getReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const reviews = await Review.find({ productId })
      .populate("userId", "firstName lastName")
      .sort({ createdAt: -1 });
    return res.status(StatusCodes.OK).json({ reviews, total: reviews.length });
  } catch (error) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
  }
};

export const getMessages = async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    return res.status(StatusCodes.OK).json({ messages, total: messages.length });
  } catch (error) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
  }
};

export const getUsers = async (req, res) => {
  try {
    const { id } = req.user;
    const { page = 1, limit = 20 } = req.query;

    const user = await User.findOne({ _id: id });

    if (!["admin", "superadmin"].includes(user.role))
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: "Unauthorized to perform this action" });

    const skip = (Number(page) - 1) * Number(limit);
    const [users, total] = await Promise.all([
      User.find().select("-password").skip(skip).limit(Number(limit)),
      User.countDocuments(),
    ]);

    return res.status(StatusCodes.OK).json({
      users,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
    });
  } catch (error) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
  }
};
