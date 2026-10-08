import { Router, Request, Response } from "express";
import { prisma } from "../db.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";

const router = Router();

router.get("/api/v1/users", authenticate, authorize("ADMIN"), async (req: Request, res: Response) => {
    const users = await prisma.user.findMany({
        include: {
            profile: true,
            _count: { select: { posts: true }},
        },
    });

    res.status(200).json(users);
});

router.get("/api/v1/users/:id", async (req: Request, res: Response) => {
    const user = await prisma.user.findUnique({
        where: { id: Number(req.params.id) },
        include: {
            profile: true,
            posts: {
                orderBy: { createdAt: "desc" },
                include: {
                    categories: true,
                }
            }
        },
    });

    if(!user) {
        res.status(404).json({ error: "User not found" });
        return;
    }

    res.status(200).json(user);
});

/* router.post("/api/v1/users", async (req: Request, res: Response) => {
    const { username, email, role, bio } = req.body;
    const user = await prisma.user.create({
        data: { 
            username, 
            email,
            role,
            profile: bio ? { create: { bio } } : undefined, 
        },
        include: { profile: true },
    });

    res.status(201).json(user);
}); */

router.put("/api/v1/users/:id", async (req: Request, res: Response) => {
    const { username, email, role } = req.body;
    const user = await prisma.user.update({
        where: { id: Number(req.params.id) },
        data: { username, email, role },
    });

    res.status(200).json(user);
});

router.get("/api/v1/users/:id/profile", authenticate, async (req: Request, res: Response) => {
    const userId = Number(req.params.id);

    const profile = await prisma.profile.findUnique({
        where: { id: userId },
    });

    res.status(200).json(profile);
});

router.put("/api/v1/users/:id/profile", authenticate, async (req: Request, res: Response) => {
    const userId = Number(req.params.id);
    const { bio, avatar } = req.body;

    const profile = await prisma.profile.upsert({
        where: { userId },
        update: { bio, avatar },
        create: { bio, avatar, userId },
    });

    res.status(200).json(profile);
});

router.delete("/api/v1/users/:id", authenticate, authorize("ADMIN"), async (req: Request, res: Response) => {
    await prisma.user.delete({
        where: { id: Number(req.params.id) },
    });

    res.status(204).send();
});

export default router;