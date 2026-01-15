import express from "express";
import cors from "cors";

import processRoutes from "./routes/processes.routes.js";
import taskRoutes from "./routes/tasks.routes.js";
import alertRoutes from "./routes/alerts.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/processes", processRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/alerts", alertRoutes);

export default app;
