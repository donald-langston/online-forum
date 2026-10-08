import { describe, it, expect, vi, beforeEach } from "vitest";
import { prismaMock } from "../mocks/prisma.ts";

vi.mock("../../db.js", () => ({
    prisma: prismaMock,
}));

vi.mock("argon2", () => ({
    hash: vi.fn().mockResolvedValue("$argon2id$v=19$mocked-hash"),
    verify: vi.fn(),
    argon2id: 2,
}));

import * as argon2 from "argon2";
import { registerUser, loginUser } from "../../services/authService.ts";

describe("Auth Service", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("hashes the password and creates user with token", async () => {
        prismaMock.user.create.mockResolvedValue({
            id: 1, email: "new@example.com", username: "New User", role: "USER",
        } as any);
        prismaMock.refreshToken.create.mockResolvedValue({} as any);

        const result =await registerUser({
            email: "new@example.com",
            username: "New User",
            password: "securepassword",
        });

        expect(argon2.hash).toHaveBeenCalledWith("securepassword", {
            type: argon2.argon2id,
        });

        expect(result.user.email).toBe("new@example.com");
        expect(result.accessToken).toBeDefined();
    });

    it("rejects wrong password with generic error", async () => {
        prismaMock.user.findUnique.mockResolvedValue({
            id: 1, email: "user@example.com", password: "$argon2idhash", role: "USER",
        } as any);

        await expect(
            loginUser({ email: "user@example.com", password: "wrong" }),
        ).rejects.toThrow("Invalid email or password");
    });
});
