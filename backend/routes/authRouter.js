import express from "express";
import { registerUser, loginUser } from "../controllers/authController.js";

const router = express.Router();

router.post("/register", registerUser); // POST /api/v1/auth/register
router.post("/login", loginUser); // POST /api/v1/auth/login

export default router;
