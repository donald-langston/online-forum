import { config } from "./config.js";
import { app } from "./app.js";
import { prisma } from "./db.js";

const server = app.listen(config.port, () => {
    console.log(`Server running on port ${config.port}`);
});

let shuttingDown = false;
const SHUTDOWN_TIMEOUT_MS = 10_000;

async function gracefulShutdown(signal: string) {
    if(shuttingDown) {
        return;
    }

    shuttingDown = true;

    console.log(`${signal} received. Starting graceful shutdown...`);

    const forceExit = setTimeout(() => {
        console.error("Forced shutdown after timeout.");
        process.exit(1);
    }, SHUTDOWN_TIMEOUT_MS);

    server.close(async () => {
        try {
            await prisma.$disconnect();
            console.log("Database connection closed.");
            clearTimeout(forceExit);
            process.exit(0);
        } catch(error) {
            console.error("Error during shutdown: ", error);
        }
    });

    server.closeIdleConnections();
}

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGTINT", () => gracefulShutdown("SIGINT"));