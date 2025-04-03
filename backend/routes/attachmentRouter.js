import express from "express";
import {
  createAttachment,
  getAttachment,
  getAllAttachments,
  updateAttachment,
  deleteAttachment,
} from "../controllers/attachmentController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/", createAttachment);
router.get("/", getAllAttachments);
router.get("/:id", getAttachment);
router.put("/:id", updateAttachment);
router.delete("/:id", deleteAttachment);

export default router;
