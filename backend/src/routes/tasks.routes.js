import express from "express";
import { createTask, addTaskEvent } from "../controllers/tasks.controller.js";

const router = express.Router();

// POST /api/tasks
router.post("/", createTask);

// POST /api/tasks/:taskId/events
router.post("/:taskId/events", addTaskEvent);

export default router;
