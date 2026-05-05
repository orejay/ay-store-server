import express from "express";
import {
  auth,
  changePassword,
  forgotPassword,
  login,
  resetPassword,
  signup,
} from "../controllers/auth.js";
import authenticateToken from "../middleware/authenticateToken.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/password", authenticateToken, changePassword);
router.get("/authenticate", authenticateToken, auth);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router;
