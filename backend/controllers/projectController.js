import { query } from "../config/database.js";

export async function createProject(req, res) {
  try {
    // เริ่มจากการดึงข้อมูลที่จำเป็นจาก request body
    const { projectName, projectDescription, category } = req.body;

    // ตรวจสอบว่าข้อมูลที่จำเป็นถูกส่งมาหรือไม่
    if (!projectName || !category) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    // สร้าง project_id ใหม่
    // โดยใช้ฟังก์ชัน generate_project_id() ที่เราสร้างไว้ใน init.sql
    const idRes = await query("SELECT generate_project_id() as id");
    const projectId = idRes.rows[0].id; // ดึง project_id ที่สร้างขึ้นมา

    await query(
      `INSERT INTO project (project_id, project_name, project_description, owner_id, category)
         VALUES ($1, $2, $3, $4, $5)`,
      [projectId, projectName, projectDescription, req.user.userId, category]
    );

    res.status(201).json({ message: "Project created", projectId });
  } catch (error) {
    console.error("Create project error: " + error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function getAllProjects(req, res) {
  try {
    // ดึงข้อมูลโปรเจคทั้งหมดที่ผู้ใช้เป็นเจ้าของหรือเป็นสมาชิก
    const result = await query(
      `SELECT p.* FROM project p
       LEFT JOIN project_member pm ON p.project_id = pm.project_id
       WHERE p.owner_id = $1 OR pm.user_id = $1`,
      [req.user.userId]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("getAllProjects error: " + error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function getProjectFromID(req, res) {
  try {
    // ดึงข้อมูลโปรเจคจาก project_id ที่ส่งมาใน request parameters
    // ตัวอย่าง URL: http://localhost:3000/projects/1
    const { id } = req.params;

    // หาข้อมูลโปรเจคที่มี project_id ตรงกับที่ส่งมาใน request parameters
    const result = await query(
      `SELECT p.* FROM project p
       LEFT JOIN project_member pm ON p.project_id = pm.project_id
       WHERE p.project_id = $1 AND (p.owner_id = $2 OR pm.user_id = $2)`,
      [id, req.user.userId]
    );

    // ถ้าไม่พบข้อมูลโปรเจคที่ตรงกับ project_id ที่ส่งมาใน request parameters
    // จะส่ง status 404 Not Found กลับไป
    if (result.rowCount === 0)
      return res.status(404).json({ error: "Not found" });

    // ถ้าพบข้อมูลโปรเจคที่ตรงกับ project_id ที่ส่งมาใน request parameters
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("getProject error: " + error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function updateProject(req, res) {}

export async function deleteProject(req, res) {}
