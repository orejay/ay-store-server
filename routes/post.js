import express from "express";
import { addAddress, addProduct, placeOrder, toggleWishlist, addCoupon, broadcastMessage, postReview } from "../controllers/post.js";
import authenticateToken from "../middleware/authenticateToken.js";
import upload from "../middleware/imageUpload.js";

const router = express.Router();

router.post("/products", authenticateToken, upload.array("images", 10), addProduct);
router.post("/addresses", authenticateToken, addAddress);
router.post("/order", authenticateToken, placeOrder);
router.post("/wishlist/:productId", authenticateToken, toggleWishlist);
router.post("/coupon", authenticateToken, addCoupon);
router.post("/message", authenticateToken, broadcastMessage);
router.post("/review/:productId", authenticateToken, postReview);

export default router;
