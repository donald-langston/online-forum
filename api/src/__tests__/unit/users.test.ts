import { describe, it, expect, vi, beforeEach } from "vitest";
import { prismaMock } from "../mocks/prisma.ts";

vi.mock("../../db.js", () => ({
    prisma: prismaMock,
}));

import request from "supertest";
import { app } from "../../app.ts";

describe("User routes (unit)", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("/api/v1/users returns a list of users", async () => {
        prismaMock.user.findMany.mockResolvedValue([
            { id: 1, username: "jon", email: "jon@example.com" },

        ] as any);

        const res = await request(app).get("/api/v1/users").expect(200);

        expect(res.body).toHaveLength(1);
        expect(res.body[0].username).toBe("jon");
    });
});