import express from "express";
import { signup, login } from "../controllers/auth.js";
import authenticateToken from "../middleware/authenticateToken.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);

export default router;
