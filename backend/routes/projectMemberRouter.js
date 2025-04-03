import express from "express";
import {
  addProjectMember,
  removeProjectMember,
} from "../controllers/projectMemberController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/:projectId/members", addProjectMember);
router.delete("/:projectId/members/:userId", removeProjectMember);

export default router;
