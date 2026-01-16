import { db } from "../config/db.js";
import Groq from "groq-sdk";
import { createAlertInternal, alertExists, predictionAlertExists, createPredictionAlert } from "./alerts.controller.js";

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
        // calcular media del proceso
        const totalAvg = bottlenecks.reduce(
            (sum, b) => sum + b.avgSeconds,
            0
        );

        const processAvgSeconds = totalAvg / bottlenecks.length;

        await saveDailyMetric(processId, processAvgSeconds);

        const trend = await checkNegativeTrend(processId, processAvgSeconds);

        if (trend) {
            const exists = await alertExists(processId, null);

            if (!exists) {
                await createAlertInternal({
                    processId,
                    stepId: null,
                    severity: "medium",
                    title: "Empeoramiento del proceso",
                    description: `El proceso es un ${trend.increasePercent}% más lento que ayer.`,
                    aiExplanation:
                        "El rendimiento general del proceso ha empeorado respecto al día anterior. Esto puede indicar sobrecarga, ineficiencias recientes o cambios en la operativa."
                });
            }
        }


        for (const bottleneck of bottlenecks) {
            const exists = await alertExists(processId, bottleneck.stepId);

            await saveStepDailyMetric(
                bottleneck.stepId,
                bottleneck.avgSeconds
            );
            if (!exists) {
                const severity = calculateSeverity(
                    bottleneck.avgSeconds,
                    processAvgSeconds
                );

                const aiExplanation = `
El paso "${bottleneck.stepName}" se ha identificado como un cuello de botella.
Su duración media es significativamente mayor que la del resto del proceso,
lo que provoca retrasos acumulados y reduce la eficiencia general.
`;
                console.log("BOTTLENECK OBJECT:", bottleneck);
                await saveStepDailyMetric(
                    bottleneck.stepId,
                    bottleneck.avgSeconds
                );

                await createAlertInternal({
                    processId,
                    stepId: bottleneck.stepId,
                    severity,
                    title: "Cuello de botella detectado",
                    description: `El paso "${bottleneck.stepName}" presenta tiempos anómalos.`,
                    aiExplanation
                });

            }
        }

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

const calculateSeverity = (stepAvg, processAvg) => {
    const ratio = stepAvg / processAvg;

    if (ratio >= 3) return "high";
    if (ratio >= 2) return "medium";
    return "low";
};

const saveDailyMetric = async (processId, avgSeconds) => {
    await db.query(
        `
    INSERT IGNORE INTO process_metrics_daily
    (process_id, avg_duration_seconds, date)
    VALUES (?, ?, CURDATE())
    `,
        [processId, Math.round(avgSeconds)]
    );
};

const checkNegativeTrend = async (processId, todayAvgSeconds) => {
    const [rows] = await db.query(
        `
    SELECT avg_duration_seconds
    FROM process_metrics_daily
    WHERE process_id = ?
      AND date = CURDATE() - INTERVAL 1 DAY
    `,
        [processId]
    );

    if (rows.length === 0) {
        return null; // no hay datos de ayer
    }

    const yesterdayAvg = rows[0].avg_duration_seconds;
    const increaseRatio = (todayAvgSeconds - yesterdayAvg) / yesterdayAvg;

    if (increaseRatio >= 0.2) {
        return {
            increasePercent: Math.round(increaseRatio * 100)
        };
    }

    return null;
};

export const getProcessMetrics = async (req, res) => {
    const { processId } = req.params;

    try {
        const [rows] = await db.query(
            `
        SELECT 
        date,
        avg_duration_seconds AS avgSeconds
        FROM process_metrics_daily
        WHERE process_id = ?
        ORDER BY date ASC
        `,
            [processId]
        );

        return res.json(rows);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Error obteniendo métricas del proceso"
        });
    }
};

const saveStepDailyMetric = async (stepId, avgSeconds) => {
    if (!stepId || !avgSeconds) return;

    await db.query(
        `
    INSERT IGNORE INTO step_metrics_daily
    (step_id, avg_duration_seconds, date)
    VALUES (?, ?, CURDATE())
    `,
        [stepId, Math.round(avgSeconds)]
    );
};

export const getStepMetrics = async (req, res) => {
    const { processId } = req.params;

    try {
        const [steps] = await db.query(
            `
      SELECT id, name
      FROM steps
      WHERE process_id = ?
      `,
            [processId]
        );

        const result = [];

        for (const step of steps) {
            const [metrics] = await db.query(
                `
        SELECT 
          date,
          avg_duration_seconds AS avgSeconds
        FROM step_metrics_daily
        WHERE step_id = ?
        ORDER BY date ASC
        `,
                [step.id]
            );

            result.push({
                stepId: step.id,
                stepName: step.name,
                metrics
            });
        }

        return res.json(result);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Error obteniendo métricas por paso"
        });
    }
};

const predictNextValue = (values) => {
    if (values.length < 2) return null;

    const last = values[values.length - 1];
    const prev = values[values.length - 2];

    const diff = last - prev;

    return Math.round(last + diff);
};

export const getStepPredictions = async (req, res) => {
    const { processId } = req.params;

    try {
        const [steps] = await db.query(
            `
      SELECT id, name
      FROM steps
      WHERE process_id = ?
      `,
            [processId]
        );

        const result = [];

        for (const step of steps) {
            const [metrics] = await db.query(
                `
        SELECT avg_duration_seconds
        FROM step_metrics_daily
        WHERE step_id = ?
        ORDER BY date ASC
        `,
                [step.id]
            );

            if (metrics.length < 2) continue;

            const values = metrics.map(m => m.avg_duration_seconds);
            const predicted = predictNextValue(values);

            const trend =
                values[values.length - 1] > values[values.length - 2]
                    ? "up"
                    : "down";

            const risk =
                predicted > values[values.length - 1] * 1.2
                    ? "high"
                    : "medium";

            if (risk === "high") {
                const exists = await predictionAlertExists(step.id);

                if (!exists) {
                    await createPredictionAlert({
                        processId,
                        stepId: step.id,
                        stepName: step.name,
                        predictedTomorrow: predicted,
                        todayAvg: values[values.length - 1],
                        trend
                    });
                }
            }

            result.push({
                stepId: step.id,
                stepName: step.name,
                todayAvg: values[values.length - 1],
                predictedTomorrow: predicted,
                trend,
                risk
            });
        }

        return res.json(result);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Error generando predicciones"
        });
    }
};

const calculateProcessScore = ({
    bottlenecks,
    predictionRisks,
    activeAlerts,
    negativeTrend
}) => {
    let score = 100;

    score -= bottlenecks * 10;
    score -= predictionRisks * 15;
    score -= activeAlerts * 5;

    if (negativeTrend) {
        score -= 10;
    }

    return Math.max(score, 0);
};

export const getProcessScore = async (req, res) => {
    const { processId } = req.params;

    try {
        const [bottlenecks] = await db.query(
            `
      SELECT COUNT(*) AS total
      FROM alerts
      WHERE process_id = ?
        AND title = 'Cuello de botella detectado'
      `,
            [processId]
        );

        const [predictionRisks] = await db.query(
            `
      SELECT COUNT(*) AS total
      FROM alerts
      WHERE process_id = ?
        AND title = 'Riesgo de empeoramiento'
      `,
            [processId]
        );

        const [activeAlerts] = await db.query(
            `
      SELECT COUNT(*) AS total
      FROM alerts
      WHERE process_id = ?
      `,
            [processId]
        );

        const negativeTrend = predictionRisks[0].total > 0;

        const score = calculateProcessScore({
            bottlenecks: bottlenecks[0].total,
            predictionRisks: predictionRisks[0].total,
            activeAlerts: activeAlerts[0].total,
            negativeTrend
        });

        const riskLevel =
            score >= 80 ? "low" :
                score >= 50 ? "medium" :
                    "high";

        return res.json({
            score,
            riskLevel,
            details: {
                bottlenecks: bottlenecks[0].total,
                predictionRisks: predictionRisks[0].total,
                activeAlerts: activeAlerts[0].total,
                trend: negativeTrend ? "negative" : "stable"
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Error calculating process score"
        });
    }
};
