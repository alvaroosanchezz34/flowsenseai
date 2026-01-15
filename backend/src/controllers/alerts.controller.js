import { db } from "../config/db.js";

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
