import express from "express";
import {
    createAlert,
    getAlertsByProcess,
    getLatestAlerts,
    acknowledgeAlert,
    resolveAlert,
    getAlertHistory
} from "../controllers/alerts.controller.js";

const router = express.Router();

// Crear alerta manual o automática
router.post("/", createAlert);

// Obtener alertas de un proceso
router.get("/process/:processId", getAlertsByProcess);

router.get("/latest", getLatestAlerts);

router.patch("/:id/ack", acknowledgeAlert);

router.post("/:alertId/resolve", resolveAlert);

router.get("/process/:processId/history", getAlertHistory);



export default router;
