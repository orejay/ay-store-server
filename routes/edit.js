import express from "express";
import {
  deleteProduct,
  editProduct,
  editAddress,
  deleteAddress,
} from "../controllers/edit.js";
import authenticateToken from "../middleware/authenticateToken.js";

const router = express.Router();

router.patch("/products/:id", authenticateToken, editProduct);
router.delete("/products/:id", authenticateToken, deleteProduct);
router.patch("/address/:id", authenticateToken, editAddress);
router.delete("/address/:id", authenticateToken, deleteAddress);

export default router;
