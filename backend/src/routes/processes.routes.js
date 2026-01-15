import express from "express";
import {
    createProcess,
    getProcesses,
    getStepTimes,
    getBottlenecks,
    explainBottlenecks
} from "../controllers/processes.controller.js";

const router = express.Router();

router.get("/", getProcesses);

router.post("/", createProcess);

router.get("/:processId/step-times", getStepTimes);
router.get("/:processId/bottlenecks", getBottlenecks);
router.get("/:processId/bottlenecks/explain", explainBottlenecks);

export default router;
