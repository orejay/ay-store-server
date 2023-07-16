import authenticateToken from "../middleware/authenticateToken.js";
import express from "express";
import {
  getAddress,
  getAddresses,
  getAllOrders,
  getDefaultAddress,
  getOrders,
  getProducts,
  getProductsByCategory,
  getUsers,
  searchProducts,
  veryPaystack,
} from "../controllers/get.js";

const router = express.Router();

router.get("/products/search", searchProducts);
router.get("/verify-paystack/:ref", authenticateToken, veryPaystack);
router.get("/users", authenticateToken, getUsers);
router.get("/orders", authenticateToken, getOrders);
router.get("/allorders/:status", authenticateToken, getAllOrders);
router.get("/products/filter", getProducts);
router.get("/products", authenticateToken, getProducts);
router.get("/addresses/:id", getAddress);
router.get("/addresses", authenticateToken, getAddresses);
router.get("/addresses/default/:id", getDefaultAddress);
router.get("/products/:category", getProductsByCategory);

export default router;
