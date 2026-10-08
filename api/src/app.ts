import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import { prisma } from "./db.js";
import userRouter from "./routes/userRoutes.js";
import postRouter from "./routes/postRouter.js";
import authRouter from "./routes/authRoutes.js";
import transactionRouter from "./routes/transactionRoutes.js";
import {
    prismaErrorHandler,
    generalErrorHandler,
} from "./middleware/errorHandler.js";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import cors from "cors";
import { apiLimiter, authLimiter } from "./middleware/rateLimiter.js";
import healthRoutes from "./routes/healthRoutes.js";
import { pinoHttp } from "pino-http";
import { logger } from "./Logger.js";

export const app = express();
app.use(pinoHttp({ logger }));
app.use(helmet());
app.use(cors({
    origin: process.env.ALLOWED_ORIGIN ?? "http://localhost:5173",
    credentials: true,
}));
app.use(healthRoutes);
app.use("/api", apiLimiter);
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);
app.use("/api/auth/refresh", authLimiter);
app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());

app.use(authRouter);
app.use(userRouter);
app.use(postRouter);
app.use(transactionRouter);

app.use(prismaErrorHandler);
app.use(generalErrorHandler);

if(process.env.NODE_ENV !== "test") {
    const PORT = process.env.PORT || 8000;

    app.listen(PORT, () => {
        console.log(`Express server running on port ${PORT}`);
    });
}

process.on("SIGINT", async () => {
    await prisma.$disconnect();
    process.exit(0);
});
