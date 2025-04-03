import express from "express";
import dotenv from "dotenv";
import { testConnection } from "./test.js";
import authRouter from "./routes/authRouter.js";
import projectRouter from "./routes/projectRouter.js";
import taskRouter from "./routes/taskRouter.js";
import attachmentRouter from "./routes/attachmentRouter.js";
import projectMemberRouter from "./routes/projectMemberRouter.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/projects", projectRouter);
app.use("/api/v1/tasks", taskRouter);
app.use("/api/v1/project-members", projectMemberRouter);
app.use("/api/v1/attachments", attachmentRouter);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  testConnection();
});
