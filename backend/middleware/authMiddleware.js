import jwt from "jsonwebtoken";

export function authMiddleware(req, res, next) {
  try {
    // เช็คว่า request มี header Authorization หรือไม่
    const authHeader = req.headers.authorization;
    let token = null;

    // ดึง token จาก header Authorization ถ้ามี
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }
    // ถ้าไม่มี token ใน header Authorization ให้ลองดึงจาก cookie
    else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    // ถ้าไม่มี token ให้ส่ง response กลับไปว่าไม่อนุญาตให้เข้าถึง
    if (!token) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // ถ้ามี token ให้ทำการ verify token ด้วย secret key
    try {
      // อันนี้คือการถอดรหัส token ออกมาโดยใช้ secret key ไว้ตรวจสอบว่า Token ที่ส่งมานั้นถูกต้องหรือไม่
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded; // แนบข้อมูลผู้ใช้ใน request object ก่อนส่งต่อไปยัง route handler function
      next(); // ถ้า token ถูกต้อง ให้เรียกใช้ next() เพื่อส่ง request ต่อไปยัง route handler ถัดไป
    } catch (jwtError) {
      console.error("JWT verification failed", jwtError);
      return res.status(401).json({ error: "Invalid or expired token" });
    }
  } catch (err) {
    console.error("Auth middleware error", err);
    return res.status(500).json({ error: "Authentication error" });
  }
}
