import Product from "../models/Product.js";
import { StatusCodes } from "http-status-codes";
import User from "../models/User.js";
import Address from "../models/Address.js";

export const addAddress = async (req, res) => {
  try {
    const { id } = req.user;
    const address = req.body;

    if (address.isDefault) {
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

    const newAddress = new Address({
      contactName: address.contactName,
      phoneNumber: address.phoneNumber,
      address: address.address,
      city: address.city,
      state: address.state,
      country: address.country,
      isDefault: address.isDefault,
      user: id,
    });
    await newAddress.save();
    return res
      .status(StatusCodes.CREATED)
      .json({ message: "address added successfully", address: newAddress });
  } catch (error) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
  }
};

export const addProduct = async (req, res) => {
  try {
    const product = req.body;

    const { id } = req.user;
    const user = await User.findById(id);

    if (!["superadmin", "admin"].includes(user.role))
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: `you're not authorized to perform this action!`,
      });

    const productExists = await Product.find({
      name: { $regex: `^${product.name}$`, $options: "i" },
    });

    if (productExists.length > 0)
      return res
        .status(StatusCodes.CONFLICT)
        .json({ message: `${product.name} already exists!` });

    const newProduct = new Product({
      name: product.name,
      price: Number(product.price),
      imageName: req.file.filename,
      imagePath: req.file.path,
      discount: Number(product.discount),
      description: product.description,
      category: product.category,
      rating: 0,
      supply: Number(product.supply),
    });

    await newProduct.save();
    return res.status(StatusCodes.CREATED).json({
      message: `${product.name} added successfully!`,
      product: newProduct,
    });
  } catch (error) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
  }
};
