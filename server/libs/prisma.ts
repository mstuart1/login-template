import { PrismaClient } from "@prisma/client";
export const prisma = new PrismaClient({
    log: ["query"] // see a log of the sql queries
});