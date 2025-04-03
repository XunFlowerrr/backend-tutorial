// authController.js
import bcrypt from "bcrypt";
import { query } from "../config/database.js";
import jwt from "jsonwebtoken";

export async function registerUser(req, res) {
  try {
    const { username, email, password } = req.body; // รับข้อมูลจาก Body

    // เช็คว่ามีข้อมูลครบถ้วนหรือไม่
    if (!username || !email || !password) {
      return res.status(400).json({
        error: "Please provide username, email, and password.",
      });
    }

    // ใส่ role ไว้ก่อน
    const role = "user";

    // เช็คว่ามี email นี้อยู่ในระบบหรือไม่ ถ้ามีให้ return error
    const existing = await query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (existing.rowCount > 0) {
      return res.status(400).json({
        error: "User with this email already exists.",
      });
    }

    // สร้าง user_id ใหม่
    const idRes = await query("SELECT generate_user_id() as id");
    const user_id = idRes.rows[0].id;

    // ใช้ bcrypt ในการเข้ารหัส Password พร้อมกับ Salt
    const hashedPassword = await bcrypt.hash(password, 10);

    // สร้าง User ใหม่ใน ตาราง users
    await query(
      `INSERT INTO users (user_id, username, email, password, role)
       VALUES ($1, $2, $3, $4, $5)`,
      [user_id, username, email, hashedPassword, role]
    );

    // ส่ง Response กลับไปว่า User ลงทะเบียนสำเร็จ
    res.status(201).json({
      success: true,
      message: "Registration successful",
      userId: user_id,
    });
  } catch (error) {
    // Handle any unexpected errors
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
}
export async function loginUser(req, res) {
  try {
    const { email, password } = req.body; // รับข้อมูลจาก Body

    // เช็คว่ามีข้อมูลครบถ้วนหรือไม่
    if (!email || !password) {
      return res.status(400).json({
        error: "Please provide email and password.",
      });
    }

    // หา User ใน Database
    const userRes = await query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (userRes.rowCount === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = userRes.rows[0];

    // ตรวจสอบ Password กับ Hashed Password ที่เก็บใน Database
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // สร้าง JWT Token โดยใช้ fucntion generateToken ที่เราสร้างขึ้น
    const token = generateToken(user);

    console.info(`User ${user.user_id} logged in successfully`);

    // ส่ง Response กลับไปว่า User Login สำเร็จ
    res.status(200).json({
      success: true,
      token,
      userId: user.user_id,
      name: user.username || user.email.split("@")[0],
      email: user.email,
    });
  } catch (error) {
    // ถ้ามี Error ให้ส่ง Response กลับไปว่า Internal server error
    console.error("Login error: " + error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function getMe(req, res) {
  try {
    const { userId } = req.user;
    const userRes = await query(
      "SELECT user_id, username, email, role FROM users WHERE user_id = $1",
      [userId]
    );
    if (userRes.rowCount === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = userRes.rows[0];

    res.status(200).json({
      userId: user.user_id,
      name: user.username,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    log.error("Get current user error: " + error);
    res.status(500).json({ error: "Internal server error" });
  }
}

function generateToken(user) {
  // สร้าง JWT Token โดยใช้ jsonwebtoken jwt.sign คือ ฟังก์ชันที่ใช้ในการสร้าง Token โดยที่เราจะส่งข้อมูลที่เราต้องการเก็บใน Token ไป
  return jwt.sign(
    {
      userId: user.user_id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET, // Secret Key ที่ใช้ในการเข้ารหัส Token
    { expiresIn: "15d" }
  );
}
