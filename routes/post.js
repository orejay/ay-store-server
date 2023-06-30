import express from "express";
import { addAddress, addProduct } from "../controllers/post.js";
import authenticateToken from "../middleware/authenticateToken.js";

const router = express.Router();

router.post("/products", authenticateToken, addProduct);
router.post("/addresses", authenticateToken, addAddress);

export default router;
