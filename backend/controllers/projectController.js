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

export async function updateProject(req, res) {
  try {
    const { id } = req.params; // ดึง project_id จาก request parameters
    const { projectName, projectDescription, category } = req.body; // ดึงข้อมูลที่ส่งมาใน request body

    // ตรวจสอบว่าข้อมูลที่จำเป็นถูกส่งมาหรือไม่
    if (!projectName || !category) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    // ทำการตรวจสอบว่าคนที่ส่งคำขออัปเดตโปรเจคนี้เป็นเจ้าของโปรเจคหรือไม่
    const ownerCheck = await query(
      "SELECT owner_id FROM project WHERE project_id = $1",
      [id]
    );
    if (
      !ownerCheck.rows[0] ||
      ownerCheck.rows[0].owner_id !== req.user.userId
    ) {
      // ถ้าคนที่ส่งคำขอไม่ใช่เจ้าของโปรเจค หรือไม่พบโปรเจคในฐานข้อมูล จะตอบกลับด้วย status 403 และไม่ให้ทำการอัปเดต
      return res.status(403).json({ error: "Not authorized" });
    }

    // ถ้าผ่านการตรวจสอบแล้ว ทำการอัปเดตโปรเจค
    await query(
      `UPDATE project SET project_name=$1, project_description=$2, category=$3
       WHERE project_id=$4`,
      [projectName, projectDescription, category, id]
    );
    // ถ้าอัปเดตสำเร็จ จะตอบกลับด้วย status 200 และข้อความว่า "Project updated"
    res.status(200).json({ message: "Project updated" });
  } catch (error) {
    // ถ้ามีข้อผิดพลาดเกิดขึ้น จะตอบกลับด้วย status 500 และข้อความว่า "Internal server error"
    console.error("updateProject error: " + error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function deleteProject(req, res) {
  try {
    const { id } = req.params; // ดึง project_id จาก request parameters

    // ทำการตรวจสอบว่าคนที่ส่งคำขอจะลบโปรเจคนี้เป็นเจ้าของโปรเจคหรือไม่
    const ownerCheck = await query(
      "SELECT owner_id FROM project WHERE project_id = $1",
      [id]
    );
    if (
      !ownerCheck.rows[0] ||
      ownerCheck.rows[0].owner_id !== req.user.userId
    ) {
      // ถ้าคนที่ส่งคำขอไม่ใช่เจ้าของโปรเจค หรือไม่พบโปรเจคในฐานข้อมูล จะตอบกลับด้วย status 403 และไม่ให้ทำการลบ
      return res.status(403).json({ error: "Not authorized" });
    }

    // ถ้าผ่านการตรวจสอบแล้ว ทำการลบโปรเจค
    await query("DELETE FROM project WHERE project_id = $1", [id]);

    // ถ้าลบสำเร็จ จะตอบกลับด้วย status 200 และข้อความว่า "Project deleted"
    res.status(200).json({ message: "Project deleted" });
  } catch (error) {
    // ถ้ามีข้อผิดพลาดเกิดขึ้น จะตอบกลับด้วย status 500 และข้อความว่า "Internal server error"
    console.error("deleteProject error: " + error);
    res.status(500).json({ error: "Internal server error" });
  }
}
