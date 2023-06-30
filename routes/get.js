import express from "express";
import {
  getProducts,
  getProductsByCategory,
  getUsers,
} from "../controllers/get.js";

const router = express.Router();

router.get("/users", getUsers);
router.get("/products", getProducts);
router.get("/products/:category", getProductsByCategory);

export default router;
