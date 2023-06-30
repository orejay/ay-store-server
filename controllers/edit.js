import Address from "../models/Address.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import { StatusCodes } from "http-status-codes";

export const deleteAddress = async (req, res) => {
  try {
    const id = req.params.id;
    const isAddress = await Address.find({ _id: id });

    if (isAddress.length < 1) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "address does not exist!" });
    } else {
      Address.findByIdAndDelete(id)
        .then(() =>
          res
            .status(StatusCodes.OK)
            .json({ message: `address deleted successfully!` })
        )
        .catch((error) =>
          res.status(StatusCodes.BAD_REQUEST).json({ message: error.message })
        );
    }
  } catch (error) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
  }
};

export const editAddress = async (req, res) => {
  try {
    const id = req.params.id;
    const address = req.body;
    const isAddress = await Address.find({ _id: id });

    if (isAddress.length >= 1) {
      Address.findByIdAndUpdate(id, address)
        .then((address) =>
          res
            .status(StatusCodes.OK)
            .json({ message: `address updated successfully!` })
        )
        .catch((error) =>
          res.status(StatusCodes.BAD_REQUEST).json({
            error: error.message,
            message: `address does not exist!`,
          })
        );
    } else {
      res.status(StatusCodes.BAD_REQUEST).json({
        message: `address does not exist!`,
      });
    }
  } catch (error) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
  }
};

export const editProduct = async (req, res) => {
  try {
    const product = req.body;
    const id = req.params.id;
    const { data } = req.user;
    const user = await User.findById(data);
    const isProduct = await Product.find({ _id: id });

    if (!["superadmin", "admin"].includes(user.role))
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: `you're not authorized to perform this action!`,
      });

    if (isProduct.length >= 1) {
      Product.findByIdAndUpdate(id, product)
        .then((product) =>
          res
            .status(StatusCodes.OK)
            .json({ message: `${product.name} updated successfully!` })
        )
        .catch((error) =>
          res.status(StatusCodes.BAD_REQUEST).json({
            error: error.message,
            message: `${product.name} does not exist!`,
          })
        );
    } else {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: `product does not exist!`,
      });
    }
  } catch (error) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const id = req.params.id;
    const { data } = req.user;
    const user = await User.findById(data);
    const isProduct = await Product.find({ _id: id });

    if (!["superadmin", "admin"].includes(user.role)) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: `you're not authorized to perform this action!`,
      });
    } else if (isProduct.length < 1) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "product does not exist!" });
    } else {
      Product.findByIdAndDelete(id)
        .then((product) =>
          res
            .status(StatusCodes.OK)
            .json({ message: `${product.name} deleted successfully!` })
        )
        .catch((error) =>
          res.status(StatusCodes.BAD_REQUEST).json({ message: error.message })
        );
    }
  } catch (error) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
  }
};
