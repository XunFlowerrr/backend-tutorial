import express from "express";
import {
  createProject,
  getProjectFromID,
  getAllProjects,
  updateProject,
  deleteProject,
} from "../controllers/projectController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, createProject);
router.get("/", authMiddleware, getAllProjects);

// /:id เรียกว่า reqest parameter ตัวอย่างเช่น http://localhost:3000/projects/1
// เป็นตัวแปรที่ใช้ในการระบุ project_id ที่เราต้องการดึงข้อมูลที่สามารถใส่มาใน URL ได้เลยโดยไม่ต้องส่งใน body
// ซึ่ง Method GET ปกติจะไม่ส่งข้อมูลใน body แต่จะส่งใน URL แทน
// ดังนั้นเราจึงใช้ request parameter ในการดึงข้อมูล project_id ที่เราต้องการ
router.get("/:id", authMiddleware, getProjectFromID);
router.put("/:id", authMiddleware, updateProject);
router.delete("/:id", authMiddleware, deleteProject);

export default router;
