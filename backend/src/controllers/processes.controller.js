import { db } from "../config/db.js";
import Groq from "groq-sdk";
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const getBottlenecksLogic = async (processId, db) => {
    const [rows] = await db.query(
        `
    SELECT 
      s.id AS step_id,
      s.name AS step_name,
      TIMESTAMPDIFF(
        SECOND,
        te.timestamp,
        (
          SELECT MIN(te2.timestamp)
          FROM task_events te2
          WHERE te2.task_id = te.task_id
            AND te2.timestamp > te.timestamp
        )
      ) AS duration_seconds
    FROM task_events te
    JOIN steps s ON te.step_id = s.id
    JOIN tasks t ON te.task_id = t.id
    WHERE t.process_id = ?
    `,
        [processId]
    );

    const stats = {};
    let total = 0;
    let count = 0;

    rows.forEach(row => {
        if (!row.duration_seconds) return;

        total += row.duration_seconds;
        count++;

        if (!stats[row.step_id]) {
            stats[row.step_id] = {
                stepId: row.step_id,
                stepName: row.step_name,
                totalSeconds: 0,
                samples: 0
            };
        }

        stats[row.step_id].totalSeconds += row.duration_seconds;
        stats[row.step_id].samples += 1;
    });

    if (count === 0) return [];

    const processAvg = total / count;

    return Object.values(stats)
        .map(step => {
            const avg = step.totalSeconds / step.samples;
            return {
                stepId: step.stepId,
                stepName: step.stepName,
                avgSeconds: Math.round(avg),
                processAvg: Math.round(processAvg),
                isBottleneck: avg > processAvg * 2
            };
        })
        .filter(step => step.isBottleneck);
};


export const createProcess = async (req, res) => {
    const { name, steps } = req.body;

    if (!name || !Array.isArray(steps) || steps.length === 0) {
        return res.status(400).json({ message: "Datos inválidos" });
    }

    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        // 1️⃣ Crear proceso
        const [processResult] = await connection.query(
            "INSERT INTO processes (name) VALUES (?)",
            [name]
        );

        const processId = processResult.insertId;

        // 2️⃣ Crear pasos
        for (let i = 0; i < steps.length; i++) {
            await connection.query(
                "INSERT INTO steps (process_id, name, order_index) VALUES (?, ?, ?)",
                [processId, steps[i], i]
            );
        }

        await connection.commit();

        res.status(201).json({
            message: "Proceso creado correctamente",
            processId
        });
    } catch (error) {
        await connection.rollback();
        console.error(error);
        res.status(500).json({ message: "Error creando el proceso" });
    } finally {
        connection.release();
    }
};

export const getProcesses = async (req, res) => {
    try {
        const [rows] = await db.query(
            "SELECT id, name, created_at FROM processes ORDER BY created_at DESC"
        );

        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error obteniendo procesos" });
    }
};

export const getStepTimes = async (req, res) => {
    const { processId } = req.params;

    try {
        const [rows] = await db.query(
            `
      SELECT 
        s.id AS step_id,
        s.name AS step_name,
        TIMESTAMPDIFF(
          SECOND,
          te.timestamp,
          (
            SELECT MIN(te2.timestamp)
            FROM task_events te2
            WHERE te2.task_id = te.task_id
              AND te2.timestamp > te.timestamp
          )
        ) AS duration_seconds
      FROM task_events te
      JOIN steps s ON te.step_id = s.id
      JOIN tasks t ON te.task_id = t.id
      WHERE t.process_id = ?
      `,
            [processId]
        );

        // Agrupar por paso
        const stats = {};

        rows.forEach(row => {
            if (!row.duration_seconds) return;

            if (!stats[row.step_id]) {
                stats[row.step_id] = {
                    stepId: row.step_id,
                    stepName: row.step_name,
                    totalSeconds: 0,
                    count: 0
                };
            }

            stats[row.step_id].totalSeconds += row.duration_seconds;
            stats[row.step_id].count += 1;
        });

        // Calcular medias
        const result = Object.values(stats).map(step => ({
            stepId: step.stepId,
            stepName: step.stepName,
            avgSeconds: Math.round(step.totalSeconds / step.count),
            samples: step.count
        }));

        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error calculando tiempos por paso"
        });
    }
};

export const getBottlenecks = async (req, res) => {
    const { processId } = req.params;

    try {
        const bottlenecks = await getBottlenecksLogic(processId, db);
        res.json(bottlenecks);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error detectando cuellos de botella"
        });
    }
};

export const explainBottlenecks = async (req, res) => {
    const { processId } = req.params;

    try {
        const bottlenecks = await getBottlenecksLogic(processId, db);

        if (bottlenecks.length === 0) {
            return res.json({
                message: "No se detectan cuellos de botella en este proceso"
            });
        }

        const prompt = `
Eres un analista de procesos empresariales.
Explica el cuello de botella en máximo 6 líneas.
Usa lenguaje claro y accionable.
No repitas los datos numéricos literalmente.


Datos:
${JSON.stringify(bottlenecks, null, 2)}
`;

        const completion = await groq.chat.completions.create({
            model: "llama-3.1-8b-instant",
            messages: [
                { role: "system", content: "Analista de procesos empresariales" },
                { role: "user", content: prompt }
            ],
            temperature: 0.3
        });

        res.json({
            explanation: completion.choices[0].message.content
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error explicando cuellos de botella"
        });
    }
};
