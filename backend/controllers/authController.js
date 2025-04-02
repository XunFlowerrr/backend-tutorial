// authController.js
import bcrypt from "bcrypt";
import { query } from "../config/database.js";

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
export const loginUser = async (req, res) => {
  const { username, password } = req.body; // รับข้อมูลจาก Body
  res
    .status(200)
    .send({ message: "User logged in successfully", username, password });
};
