const requiredVars = ["DATABASE_URL"] as const;

for(const envVar of requiredVars) {
    if(!process.env[envVar]) {
        console.error(`Missing required environment variable: ${envVar}`);
        process.exit(1);
    }
}

const port = Number(process.env.PORT ?? 3000);
if(!Number.isInteger(port) || port <= 0 || port > 65535) {
    console.error("PORT must be an integer between 1 and 65535");
    process.exit(1);
}

export const config = {
    port,
    nodeEnv: process.env.NODE_ENV || "development",
    databaseUrl: process.env.DATABASE_URL!,
    corsOrigin: process.env.CORS_ORIGIN || "http://localhost:5173",
    logLevel: process.env.LOG_LEVEL || "debug",
} as const;