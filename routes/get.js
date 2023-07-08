import authenticateToken from "../middleware/authenticateToken.js";
import express from "express";
import {
  getAddress,
  getAddresses,
  getDefaultAddress,
  getOrders,
  getProducts,
  getProductsByCategory,
  getUsers,
  searchProducts,
} from "../controllers/get.js";

const router = express.Router();

router.get("/products/search", searchProducts);
router.get("/users", getUsers);
router.get("/orders/:id", getOrders);
router.get("/products/filter", getProducts);
router.get("/addresses/:id", getAddress);
router.get("/addresses", authenticateToken, getAddresses);
router.get("/addresses/default/:id", getDefaultAddress);
router.get("/products/:category", getProductsByCategory);

export default router;
