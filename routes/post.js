import express from "express";
import { addAddress, addProduct } from "../controllers/post.js";
import authenticateToken from "../middleware/authenticateToken.js";
import upload from "../middleware/imageUpload.js";

const router = express.Router();

router.post("/products", authenticateToken, upload.single("image"), addProduct);
router.post("/addresses", authenticateToken, addAddress);

export default router;
