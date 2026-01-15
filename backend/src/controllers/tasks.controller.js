import { db } from "../config/db.js";

export const createTask = async (req, res) => {
    const { processId } = req.body;

    if (!processId) {
        return res.status(400).json({ message: "processId es obligatorio" });
    }

    const [process] = await db.query(
        "SELECT id FROM processes WHERE id = ?",
        [processId]
    );

    if (process.length === 0) {
        return res.status(404).json({
            message: "El proceso no existe"
        });
    }

    try {
        const [result] = await db.query(
            "INSERT INTO tasks (process_id) VALUES (?)",
            [processId]
        );

        res.status(201).json({
            message: "Tarea creada correctamente",
            taskId: result.insertId
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error creando la tarea" });
    }
};

export const addTaskEvent = async (req, res) => {
    const { taskId } = req.params;
    const { stepId, timestamp } = req.body;

    if (!stepId) {
        return res.status(400).json({
            message: "stepId es obligatorio"
        });
    }

    const [task] = await db.query(
        "SELECT id FROM tasks WHERE id = ?",
        [taskId]
    );

    if (task.length === 0) {
        return res.status(404).json({
            message: "La tarea no existe"
        });
    }

    try {
        await db.query(
            `INSERT INTO task_events (task_id, step_id, timestamp)
        VALUES (?, ?, ?)`,
            [taskId, stepId, timestamp || new Date()]
        );

        res.status(201).json({
            message: "Evento registrado correctamente"
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error registrando el evento"
        });
    }
};
