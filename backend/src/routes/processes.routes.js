import express from "express";
import {
    createProcess,
    getProcesses,
    getStepTimes,
    getBottlenecks,
    explainBottlenecks,
    getProcessMetrics,
    getStepMetrics,
    getStepPredictions,
    getProcessScore
} from "../controllers/processes.controller.js";

const router = express.Router();

router.get("/", getProcesses);

router.post("/", createProcess);

router.get("/:processId/step-times", getStepTimes);
router.get("/:processId/bottlenecks", getBottlenecks);
router.get("/:processId/bottlenecks/explain", explainBottlenecks);
router.get("/:processId/metrics", getProcessMetrics);
router.get("/:processId/steps/metrics", getStepMetrics);
router.get("/:processId/steps/prediction", getStepPredictions);
router.get("/:processId/score", getProcessScore);

export default router;