import express from "express";
import {
  getAddress,
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
router.get("/address/:id", getAddress);
router.get("/address/default/:id", getDefaultAddress);
router.get("/products/:category", getProductsByCategory);

export default router;
