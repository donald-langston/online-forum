import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../../app.ts";
import { prisma } from "../../db.ts";
import { createTestUser } from "../../helpers/authHelper.ts";

describe("Auth Endpoints", () => {
    beforeEach(async () => {
        await prisma.refreshToken.deleteMany();
        await prisma.post.deleteMany();
        await prisma.user.deleteMany();
    });

    it("registers and sets httponly cookie", async () => {
        const res = await request(app)
            .post("/api/auth/register")
            .send({
                email: "new@example.com",
                username: "New User",
                password: "securepassword"
            });
        
        expect(res.status).toBe(201);
        expect(res.body.user.password).toBeUndefined;
        expect(res.headers["set-cookie"][0]).toContain("HttpOnly");
    });

    it("returns 401 without token, 403 without role", async () => {
        const noAuth = await request(app).get("/api/v1/users");
        expect(noAuth.status).toBe(401);

        const { accessToken } = await await createTestUser();
        const noRole = await request(app).get("/api/v1/users").set("Authorization", `Bearer ${accessToken}`);
        expect(noRole.status).toBe(403);
    });

    it("invalidates refresh token after logout", async () => {
        const { cookies } = await createTestUser();

        await request(app).post("/api/auth/logout").set("Cookie", cookies);
        
        const res = await request(app).post("/api/auth/refresh").set("Cookie", cookies);
        expect(res.status).toBe(401);
    });
});