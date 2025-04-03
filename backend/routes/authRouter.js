import express from "express";
import { registerUser, loginUser, getMe } from "../controllers/authController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser); // POST /api/v1/auth/register
router.post("/login", loginUser); // POST /api/v1/auth/login

// เป็นการบอกว่าให้ใช้ middleware ก่อนจะส่งไปยัง controller getMe น้ะะ
router.get("/me", authMiddleware, getMe); // GET /api/v1/auth/me

export default router;
