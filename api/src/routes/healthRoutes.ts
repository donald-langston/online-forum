import { Router } from "express";
import { prisma } from "../db.js";

const router = Router();

router.get("/healthz", (_req, res) => {
    res.status(200).json({ status: "ok" });
});

router.get("/readyz", async (_req, res) => {
    try {
        await prisma.$queryRaw`SELECT 1`;
        res.status(200).json({ status: "ready" });
    } catch {
        res.status(503).json({ status: "not ready" });
    }
});

export default router;