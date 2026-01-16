import { db } from "../config/db.js";
import { generatePredictionExplanation } from "../services/aiExplanation.service.js";
import { improveExplanationWithAI } from "../services/aiText.service.js";
import { sendWebhook, sendEmail } from "../services/notification.service.js";


// POST /api/alerts
export const createAlert = async (req, res) => {
    const { processId, stepId, severity, title, description } = req.body;

    if (!processId || !severity || !title || !description) {
        return res.status(400).json({
            message: "Faltan campos obligatorios"
        });
    }

    try {
        const [result] = await db.query(
            `INSERT INTO alerts (process_id, step_id, severity, title, description)
       VALUES (?, ?, ?, ?, ?)`,
            [processId, stepId || null, severity, title, description]
        );

        res.status(201).json({
            message: "Alerta creada correctamente",
            alertId: result.insertId
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error creando la alerta"
        });
    }
};

// GET /api/alerts/process/:processId
export const getAlertsByProcess = async (req, res) => {
    const { processId } = req.params;

    try {
        const [rows] = await db.query(
            `
      SELECT 
        a.id,
        a.severity,
        a.title,
        a.description,
        a.ai_explanation,
        a.created_at,
        s.name AS stepName
      FROM alerts a
      LEFT JOIN steps s ON a.step_id = s.id
      WHERE a.process_id = ?
      AND a.acknowledged = FALSE
      ORDER BY a.created_at DESC
      `,
            [processId]
        );

        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error obteniendo alertas"
        });
    }
};

export const createAlertInternal = async ({
    processId,
    stepId,
    severity,
    title,
    description,
    aiExplanation = null
}) => {
    await db.query(
        `
    INSERT INTO alerts 
    (process_id, step_id, severity, title, description, ai_explanation)
    VALUES (?, ?, ?, ?, ?, ?)
    `,
        [processId, stepId, severity, title, description, aiExplanation]
    );
};


export const alertExists = async (processId, stepId) => {
    const [rows] = await db.query(
        `
    SELECT id
    FROM alerts
    WHERE process_id = ?
      AND step_id = ?
      AND created_at > NOW() - INTERVAL 24 HOUR
    `,
        [processId, stepId]
    );

    return rows.length > 0;
};

export const getLatestAlerts = async (req, res) => {
    try {
        const [rows] = await db.query(`
      SELECT
        a.id,
        a.severity,
        a.title,
        a.description,
        a.created_at,
        p.name AS processName,
        s.name AS stepName
      FROM alerts a
      JOIN processes p ON a.process_id = p.id
      LEFT JOIN steps s ON a.step_id = s.id
      ORDER BY a.created_at DESC
      LIMIT 20
    `);

        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error obteniendo alertas globales"
        });
    }
};

export const acknowledgeAlert = async (req, res) => {
    const { id } = req.params;

    try {
        await db.query(
            "UPDATE alerts SET acknowledged = TRUE WHERE id = ?",
            [id]
        );

        res.json({ message: "Alerta reconocida" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error reconociendo alerta" });
    }
};

export const predictionAlertExists = async (stepId) => {
    const [rows] = await db.query(
        `
    SELECT id
    FROM alerts
    WHERE step_id = ?
      AND title = 'Riesgo de empeoramiento'
      AND DATE(created_at) = CURDATE()
    `,
        [stepId]
    );

    return rows.length > 0;
};

export const createPredictionAlert = async ({
    processId,
    stepId,
    stepName,
    predictedTomorrow,
    todayAvg,
    trend
}) => {
    let aiExplanation = generatePredictionExplanation({
        stepName,
        todayAvg,
        predictedTomorrow,
        trend
    });

    console.log("GROQ KEY:", process.env.GROQ_API_KEY);
    if (process.env.GROQ_API_KEY) {
        aiExplanation = await improveExplanationWithAI(aiExplanation);
    }

    await db.query(
        `
    INSERT INTO alerts
    (process_id, step_id, severity, title, description, ai_explanation)
    VALUES (?, ?, 'high', ?, ?, ?)
    `,
        [
            processId,
            stepId,
            "Riesgo de empeoramiento",
            `El paso "${stepName}" podría empeorar mañana.`,
            `Se detecta una tendencia negativa en este paso.`,
            aiExplanation
        ]
    );
    await sendWebhook({
        type: "ALERT",
        severity: "high",
        title: "Riesgo de empeoramiento",
        description: `El paso "${stepName}" podría empeorar mañana.`,
        processId,
        stepId
    });

    await sendEmail({
        to: process.env.ALERT_EMAIL,
        subject: "⚠️ FlowSense AI – Riesgo detectado",
        text: `El paso "${stepName}" podría empeorar mañana.\n\nRevisa el proceso en FlowSense AI.`
    });

};

export const resolveAlert = async (req, res) => {
    const { alertId } = req.params;

    try {
        await db.query(
            `
      UPDATE alerts
      SET status = 'resolved',
          resolved_at = NOW()
      WHERE id = ?
      `,
            [alertId]
        );

        return res.json({
            message: "Alert resolved successfully"
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Error resolving alert"
        });
    }
};

export const getAlertHistory = async (req, res) => {
    const { processId } = req.params;

    try {
        const [rows] = await db.query(
            `
      SELECT
        id,
        title,
        severity,
        status,
        created_at,
        resolved_at,
        TIMESTAMPDIFF(
          HOUR,
          created_at,
          resolved_at
        ) AS duration_hours
      FROM alerts
      WHERE process_id = ?
      ORDER BY created_at DESC
      `,
            [processId]
        );

        return res.json(rows);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Error fetching alert history"
        });
    }
};
