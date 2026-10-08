import "dotenv/config";
import { randomUUID } from "node:crypto";
import { SignJWT, jwtVerify, errors } from "jose";
import { prisma } from "../db.js";

const accessSecret = new TextEncoder().encode(process.env.JWT_ACCESS_SECRET);
const refreshSecret = new TextEncoder().encode(process.env.JWT_REFRESH_SECRET);

export async function createAccessToken(userId: number, role: string): Promise<string> {
    return new SignJWT({ role })
        .setProtectedHeader({ alg: "HS256" })
        .setSubject(String(userId))
        .setJti(randomUUID())
        .setIssuedAt()
        .setExpirationTime("15m")
        .sign(accessSecret);
}

export async function createRefreshToken(userId: number): Promise<string> {
    return new SignJWT({})
        .setProtectedHeader({ alg: "HS256" })
        .setSubject(String(userId))
        .setJti(randomUUID())
        .setIssuedAt()
        .setExpirationTime("7d")
        .sign(refreshSecret);
}

export function daysFromNow(days: number): Date {
    return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

export async function cleanupExpiredTokens() {
    const result = await prisma.refreshToken.deleteMany({
        where: {
            expiresAt: { lt: new Date() },
        },
    });

    return result.count;
}