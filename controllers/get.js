import Product from "../models/Product.js";
import User from "../models/User.js";
import ProductStat from "../models/ProductStat.js";
import { StatusCodes } from "http-status-codes";
import Address from "../models/Address.js";
import Order from "../models/Orders.js";
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
      .populate("order.productId");

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
      .populate("order.productId");

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
    const { category, priceRange, discount, rating } = req.query;
    const filter = {};

    if (category) {
      const categories = category.split(",");

      filter.category = { $in: categories };
    }
    if (discount === "true") filter.discount = { $gte: 1 };
    console.log(discount);
    if (priceRange) {
      const [minPrice, maxPrice] = priceRange.split("-");
      filter.price = { $gte: minPrice, $lte: maxPrice };
    }
    if (rating) {
      const [minRating, maxRating] = rating.split("-");
      filter.rating = { $gte: minRating, $lte: maxRating };
    }

    const products = await Product.find(filter, {
      name: 1,
      price: 1,
      category: 1,
      rating: 1,
      description: 1,
      discount: 1,
      imageName: 1,
      imagePath: 1,
      supply: 1,
    });

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
