import Address from "../models/Address.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";

export const setAsDefaultAddress = async (req, res) => {
  try {
    const { id } = req.user;
    const addressId = req.params.id;

    const isAddress = Address.findOne({ _id: addressId });

    if (isAddress) {
      const defaultAddress = await Address.findOne({
        user: id,
        isDefault: true,
      });

      if (defaultAddress) {
        Address.findByIdAndUpdate(defaultAddress._id, { isDefault: false })
          .then(() => console.log("updated old address", true))
          .catch((error) =>
            res.status(StatusCodes.BAD_REQUEST).json({
              error: error.message,
              message: `address does not exist!`,
            })
          );
      }

      Address.findByIdAndUpdate(addressId, { isDefault: true })
        .then(() =>
          res
            .status(StatusCodes.OK)
            .json({ message: `Address Updated Successfully!` })
        )
        .catch((error) =>
          res.status(StatusCodes.BAD_REQUEST).json({
            error: error.message,
            message: `address does not exist!`,
          })
        );
    }
  } catch (error) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
  }
};

export const editUser = async (req, res) => {
  try {
    const { id } = req.user;
    const isUser = await User.find({ _id: id });
    const { firstName, lastName, email, phoneNumber } = req.body;
    const jwtExpiration = process.env.JWT_EXPIRATION;
    const jwtSecret = process.env.JWT_SECRET;
    const token = jwt.sign({ id: id }, jwtSecret, {
      expiresIn: Number(jwtExpiration),
    });
    const filter = {};

    if (firstName !== "") filter.firstName = firstName;

    if (lastName !== "") filter.lastName = lastName;

    if (email !== "") filter.email = email;

    if (phoneNumber !== "") filter.phoneNumber = phoneNumber;

    if (isUser.length < 1)
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "User does not exist!" });

    if (isUser.length >= 1) {
      User.findByIdAndUpdate(id, filter)
        .then(() =>
          res.status(StatusCodes.OK).json({
            message: `user updated successfully!`,
            userData: {
              firstName: isUser[0].firstName,
              lastName: isUser[0].lastName,
              email: isUser[0].email,
              phoneNumber: isUser[0].phoneNumber,
              role: isUser[0].role,
              id: id,
              token: token,
            },
          })
        )
        .catch((error) =>
          res.status(StatusCodes.BAD_REQUEST).json({
            error: error.message,
            message: `address does not exist!`,
          })
        );
    }
  } catch (error) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
  }
};

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
    const { id } = req.user;
    const addressId = req.params.id;
    const {
      contactName,
      phoneNumber,
      address,
      country,
      state,
      city,
      isDefault,
    } = req.body;
    const filter = {};

    if (contactName !== "") filter.contactName = contactName;
    if (address !== "") filter.address = address;
    if (country !== "") filter.country = country;
    if (phoneNumber !== "") filter.phoneNumber = phoneNumber;
    if (state !== "") filter.state = state;
    if (city !== "") filter.city = city;
    if (isDefault) {
      const defaultAddress = await Address.findOne({
        user: id,
        isDefault: true,
      });

      if (defaultAddress) {
        Address.findByIdAndUpdate(defaultAddress._id, { isDefault: false })
          .then(() => console.log("updated", true))
          .catch((error) =>
            res.status(StatusCodes.BAD_REQUEST).json({
              error: error.message,
              message: `address does not exist!`,
            })
          );
      }
    }
    filter.isDefault = isDefault;

    const isAddress = await Address.findOne({ _id: addressId });

    if (isAddress) {
      Address.findByIdAndUpdate(addressId, filter)
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
