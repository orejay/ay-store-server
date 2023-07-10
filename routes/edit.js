import express from "express";
import {
  deleteProduct,
  editProduct,
  editAddress,
  deleteAddress,
  editUser,
  setAsDefaultAddress,
} from "../controllers/edit.js";
import authenticateToken from "../middleware/authenticateToken.js";
import upload from "../middleware/imageUpload.js";

const router = express.Router();

router.patch(
  "/products/:id",
  authenticateToken,
  upload.single("image"),
  editProduct
);
router.patch(
  "/addresses/set-default/:id",
  authenticateToken,
  setAsDefaultAddress
);
router.delete("/products/:id", authenticateToken, deleteProduct);
router.patch("/user", authenticateToken, editUser);
router.patch("/addresses/:id", authenticateToken, editAddress);
router.delete("/addresses/:id", authenticateToken, deleteAddress);

export default router;
