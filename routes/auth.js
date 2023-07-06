import express from "express";
import { signup, login, changePassword } from "../controllers/auth.js";
import authenticateToken from "../middleware/authenticateToken.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/password", authenticateToken, changePassword);

export default router;
