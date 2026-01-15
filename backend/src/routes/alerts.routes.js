import express from "express";

const router = express.Router();

// placeholder por ahora
router.get("/", (req, res) => {
    res.json({ message: "Alerts endpoint OK" });
});

export default router;
