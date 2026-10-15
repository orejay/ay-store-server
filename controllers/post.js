import Product from "../models/Product.js";
import { StatusCodes } from "http-status-codes";
import User from "../models/User.js";
import Address from "../models/Address.js";
import Order from "../models/Orders.js";
import PaystackPayments from "../models/PaystackPayments.js";
import Wishlist from "../models/Wishlist.js";
import Coupon from "../models/Coupon.js";
import Message from "../models/Message.js";
import Review from "../models/Review.js";
import DeliveryZone from "../models/DeliveryZone.js";
import Subscriber from "../models/Subscriber.js";
import { sendReceiptEmail, sendNewsletterEmail } from "../utils/email.js";

export const placeOrder = async (req, res) => {
  try {
    const userId = req.user?.id || null;
    const {
      order, address, instructions, price, ref, couponCode,
      shippingMethod, shippingFee, guestEmail, guestAddress,
    } = req.body;
    const products = [];

    for (let i = 0; i < order.length; i++) {
      const item = {};
      item.product = order[i]._id;
      item.quantity = order[i].quantity;
      if (order[i].variantId) item.variantId = order[i].variantId;
      products.push(item);

      if (order[i].variantId) {
        await Product.updateOne(
          { _id: order[i]._id, "variants._id": order[i].variantId },
          { $inc: { "variants.$.stock": -Number(order[i].quantity) } }
        );
      } else {
        const product = await Product.findOne({ _id: order[i]._id });
        Product.findByIdAndUpdate(product._id, {
          supply: Number(product.supply) - Number(order[i].quantity),
        }).catch((error) =>
          res.status(StatusCodes.BAD_REQUEST).json({
            error: error.message,
            message: `${product.name} does not exist!`,
          })
        );
      }
    }

    let discountAmount = 0;
    let appliedCoupon = null;

    if (couponCode) {
      const coupon = await Coupon.findOne({
        code: couponCode.toUpperCase(),
        active: true,
      });
      if (!coupon)
        return res
          .status(StatusCodes.NOT_FOUND)
          .json({ message: "Coupon not found or inactive." });
      if (coupon.expiresAt && coupon.expiresAt < new Date())
        return res
          .status(StatusCodes.GONE)
          .json({ message: "Coupon has expired." });
      if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses)
        return res
          .status(StatusCodes.GONE)
          .json({ message: "Coupon usage limit reached." });

      if (coupon.discountType === "percent") {
        discountAmount = parseFloat(
          ((Number(price) * coupon.discountValue) / 100).toFixed(2)
        );
      } else {
        discountAmount = coupon.discountValue;
      }

      appliedCoupon = coupon.code;
      coupon.usedCount += 1;
      await coupon.save();
    }

    let addressId = null;
    let savedAddress = null;

    if (guestAddress && !userId) {
      const newAddr = new Address({
        contactName: guestAddress.contactName,
        phoneNumber: guestAddress.phoneNumber,
        address: guestAddress.address,
        city: guestAddress.city,
        state: guestAddress.state,
        country: guestAddress.country || "Nigeria",
        isDefault: false,
        user: null,
      });
      await newAddr.save();
      addressId = newAddr._id;
      savedAddress = newAddr;
    } else if (address) {
      addressId = address._id;
      savedAddress = await Address.findById(address._id);
    }

    const newOrder = new Order({
      userId: userId,
      order: products,
      price: price,
      discountAmount,
      couponCode: appliedCoupon,
      address: addressId,
      instructions: instructions,
      shippingMethod: shippingMethod || "standard",
      shippingFee: shippingFee || 1500,
      guestEmail: guestEmail || null,
    });

    await newOrder.save();

    const newPaystackPayment = new PaystackPayments({
      userId: userId,
      orderId: newOrder._id,
      paymentRef: ref,
    });

    await newPaystackPayment.save();

    const populatedOrder = await Order.findById(newOrder._id).populate("order.product");
    const itemDetails = populatedOrder.order.map((o) => ({
      name: o.product?.name || "Product",
      quantity: o.quantity,
      price: o.product?.price || 0,
    }));

    const recipientEmail = guestEmail || (userId ? (await User.findById(userId))?.email : null);
    if (recipientEmail) {
      sendReceiptEmail(recipientEmail, newOrder, itemDetails, savedAddress).catch((err) =>
        console.error("Receipt email error:", err.message)
      );
    }

    return res.status(StatusCodes.CREATED).json({ newOrder });
  } catch (error) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
  }
};

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

    const files = req.files || (req.file ? [req.file] : []);
    const imageNames = files.map((f) => f.filename);
    let variants = [];
    if (product.variants) {
      try { variants = JSON.parse(product.variants); } catch (_) {}
    }

    const newProduct = new Product({
      name: product.name,
      price: Number(product.price),
      imageName: imageNames[0] || "",
      imagePath: files[0]?.path || "",
      images: imageNames,
      discount: Number(product.discount),
      description: product.description,
      category: product.category,
      gender: product.gender || "none",
      brand: product.brand || "",
      tags: product.tags
        ? product.tags.split(",").map((t) => t.trim()).filter(Boolean)
        : [],
      featured: product.featured === "true",
      rating: 0,
      supply: Number(product.supply),
      variants,
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

export const toggleWishlist = async (req, res) => {
  try {
    const { id } = req.user;
    const productId = req.params.productId;
    let wishlist = await Wishlist.findOne({ userId: id });
    if (!wishlist) {
      wishlist = new Wishlist({ userId: id, productIds: [productId] });
      await wishlist.save();
      return res.status(StatusCodes.CREATED).json({ saved: true });
    }
    const isSaved = wishlist.productIds.some((p) => p.toString() === productId);
    if (isSaved) {
      wishlist.productIds = wishlist.productIds.filter((p) => p.toString() !== productId);
    } else {
      wishlist.productIds.push(productId);
    }
    await wishlist.save();
    return res.status(StatusCodes.OK).json({ saved: !isSaved });
  } catch (error) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
  }
};

export const postReview = async (req, res) => {
  try {
    const { id } = req.user;
    const { productId } = req.params;
    const { rating, text } = req.body;

    if (!rating || !text)
      return res.status(StatusCodes.BAD_REQUEST).json({ message: "Rating and text are required." });

    const product = await Product.findById(productId);
    if (!product)
      return res.status(StatusCodes.NOT_FOUND).json({ message: "Product not found." });

    const review = new Review({ userId: id, productId, rating: Number(rating), text });
    await review.save();

    const all = await Review.find({ productId });
    const avg = all.reduce((sum, r) => sum + r.rating, 0) / all.length;
    await Product.findByIdAndUpdate(productId, { rating: Math.round(avg * 10) / 10 });

    const populated = await review.populate("userId", "firstName lastName");
    return res.status(StatusCodes.CREATED).json({ review: populated });
  } catch (error) {
    if (error.code === 11000)
      return res.status(StatusCodes.CONFLICT).json({ message: "You have already reviewed this product." });
    return res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
  }
};

export const broadcastMessage = async (req, res) => {
  try {
    const { id } = req.user;
    const user = await User.findById(id);
    if (!["admin", "superadmin"].includes(user.role))
      return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Unauthorized." });
    const { subject, body } = req.body;
    if (!subject || !body)
      return res.status(StatusCodes.BAD_REQUEST).json({ message: "Subject and body are required." });
    const message = new Message({ subject, body });
    await message.save();
    return res.status(StatusCodes.CREATED).json({ message: "Message sent.", data: message });
  } catch (error) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
  }
};

export const addCoupon = async (req, res) => {
  try {
    const { id } = req.user;
    const user = await User.findById(id);
    if (!["admin", "superadmin"].includes(user.role))
      return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Unauthorized." });
    const { code, discountType, discountValue, expiresAt, maxUses } = req.body;
    const exists = await Coupon.findOne({ code: code.toUpperCase() });
    if (exists)
      return res.status(StatusCodes.CONFLICT).json({ message: "Coupon code already exists." });
    const coupon = new Coupon({
      code: code.toUpperCase(),
      discountType: discountType || "percent",
      discountValue: Number(discountValue),
      maxUses: maxUses ? Number(maxUses) : null,
      expiresAt: expiresAt || undefined,
    });
    await coupon.save();
    return res.status(StatusCodes.CREATED).json({ message: "Coupon created.", coupon });
  } catch (error) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
  }
};

export const addDeliveryZone = async (req, res) => {
  try {
    const { id } = req.user;
    const user = await User.findById(id);
    if (!["admin", "superadmin"].includes(user.role))
      return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Unauthorized." });
    const { name, price, areas, extraChargeAboveKg, extraChargeNote } = req.body;
    const zone = new DeliveryZone({
      name,
      price: Number(price),
      areas: areas || [],
      extraChargeAboveKg: extraChargeAboveKg || 5,
      extraChargeNote: extraChargeNote || "",
    });
    await zone.save();
    return res.status(StatusCodes.CREATED).json({ message: "Delivery zone created.", zone });
  } catch (error) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
  }
};

export const subscribe = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email)
      return res.status(StatusCodes.BAD_REQUEST).json({ message: "Email is required." });
    const existing = await Subscriber.findOne({ email: email.toLowerCase() });
    if (existing) {
      if (!existing.active) {
        existing.active = true;
        await existing.save();
        return res.status(StatusCodes.OK).json({ message: "Subscribed successfully." });
      }
      return res.status(StatusCodes.OK).json({ message: "Already subscribed." });
    }
    await new Subscriber({ email: email.toLowerCase() }).save();
    return res.status(StatusCodes.CREATED).json({ message: "Subscribed successfully." });
  } catch (error) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
  }
};

export const unsubscribe = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email)
      return res.status(StatusCodes.BAD_REQUEST).json({ message: "Email is required." });
    await Subscriber.findOneAndUpdate({ email: email.toLowerCase() }, { active: false });
    return res.status(StatusCodes.OK).json({ message: "Unsubscribed successfully." });
  } catch (error) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
  }
};

export const sendNewsletter = async (req, res) => {
  try {
    const { id } = req.user;
    const user = await User.findById(id);
    if (!["admin", "superadmin"].includes(user.role))
      return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Unauthorized." });
    const { subject, body } = req.body;
    if (!subject || !body)
      return res.status(StatusCodes.BAD_REQUEST).json({ message: "Subject and body are required." });

    const subscribers = await Subscriber.find({ active: true });
    let sent = 0;
    for (const sub of subscribers) {
      try {
        await sendNewsletterEmail(sub.email, subject, body);
        sent++;
      } catch (err) {
        console.error(`Failed to send to ${sub.email}:`, err.message);
      }
    }
    return res.status(StatusCodes.OK).json({ message: `Newsletter sent to ${sent} subscribers.` });
  } catch (error) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
  }
};
