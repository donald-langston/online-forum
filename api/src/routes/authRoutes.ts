import { Router, type Request, type Response } from "express";
import { registerUser, loginUser } from "../services/authService.js";
import { validate } from "../middleware/validate.js";
import { registerSchema, loginSchema } from "../schemas/auth.js";
import { clearRefreshTokenCookie, setRefreshTokenCookie } from "../utils/cookies.js";
import { jwtVerify } from "jose";
import { prisma } from "../db.js";
import { createAccessToken, createRefreshToken, daysFromNow } from "../utils/jwt.js";
import { authenticate } from "../middleware/authenticate.js";

const router = Router();

router.post("/api/auth/register", validate(registerSchema), async (req: Request, res: Response) => {
    const { user, accessToken, refreshToken } = await registerUser(req.body);

    setRefreshTokenCookie(res, refreshToken);
    res.status(201).json({ user, accessToken });
});

router.post("/api/auth/login", validate(loginSchema), async (req: Request, res: Response) => {
    const { user, accessToken, refreshToken } = await loginUser(req.body);

    setRefreshTokenCookie(res, refreshToken);
    res.status(200).json({ user, accessToken });
});

router.post("/api/auth/refresh", async (req: Request, res: Response) => {
    const oldToken = req.cookies.refreshToken;

    if(!oldToken) {
        res.status(401).json({ error: "UNAUTHORIZED" });
        return;
    }

    const refreshSecret = new TextEncoder().encode(process.env.JWT_REFRESH_SECRET);
    const { payload } = await jwtVerify(oldToken, refreshSecret);

    const storedToken = await prisma.refreshToken.findUnique({
        where: { token: oldToken },
    });

    if(!storedToken || storedToken.expiresAt < new Date()) {
        clearRefreshTokenCookie(res);
        res.status(401).json({ error: "TOKEN_REVOKED" });
        return;
    }

    const user = await prisma.user.findUniqueOrThrow({
        where: { id: Number(payload.sub) },
    });

    const accessToken = await createAccessToken(user.id, user.role);
    const newRefreshToken = await createRefreshToken(user.id);

    await prisma.$transaction(async (tx) => {
        await tx.refreshToken.delete({ where: { id: storedToken.id } });
        await tx.refreshToken.create({
            data: {
                token: newRefreshToken,
                userId: user.id,
                expiresAt: daysFromNow(7),
            },
        });
    });

    setRefreshTokenCookie(res, newRefreshToken);
    res.json({ accessToken });
});

router.post("/api/auth/logout", async (req: Request, res: Response) => {
    const token = req.cookies.refreshToken;

    if(token) {
        await prisma.refreshToken.deleteMany({
            where: { token },
        });
    }

    clearRefreshTokenCookie(res);
    res.status(204).send();
});

router.delete("/api/auth/sessions", authenticate, async (req: Request, res: Response) => {
    await prisma.refreshToken.deleteMany({
        where: { userId: req.user!.id },
    });

    clearRefreshTokenCookie(res);
    res.status(204).send();
});

export default router;