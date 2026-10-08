import "dotenv/config";
import { PrismaClient } from"../src/generated/prisma/client.ts";
import { PrismaPg } from "@prisma/adapter-pg";
import * as argon2 from "argon2";

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
    await prisma.$transaction([
        prisma.post.deleteMany(),
        prisma.profile.deleteMany(),
        prisma.user.deleteMany(),
        prisma.category.deleteMany(),
    ]);

    const ts = await prisma.category.create({
        data: { name: "Typescript" },
    });

    const nc = await prisma.category.create({
        data: { name: "Node Js" },
    });

    const hash = await argon2.hash("password123", { type: argon2.argon2id });

    await prisma.user.create({
        data: {
            username: "jon",
            email: "jon@example.com",
            password: hash,
            role: "ADMIN",
            profile: {
                create: { bio: "Full-stack developer" },
            },
            posts: {
                create: {
                    title: "Getting Started with TypeScript",
                    content: "Typescript adds static typing to JavaScript",
                    published: true,
                    views: 142,
                    categories: {  connect: [{ id: ts.id }] },
                },
            },
        },
    });

    await prisma.user.create({
        data: {
            username: "sarah",
            email: "sarah@example.com",
            password: hash,
            role: "USER",
            profile: {
                create: { bio: "Full-stack developer" },
            },
            posts: {
                create: {
                    title: "Getting Started with Node",
                    content: "Node allows JavaScript to run on the server",
                    published: true,
                    views: 190,
                    categories: {  connect: [{ id: ts.id }] },
                },
            },
        },
    });

    console.log("Seeding complete.");
}

main()
    .catch((e) => {
        console.error("Seeding failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
});