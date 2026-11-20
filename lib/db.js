import {PrismaClient} from "@prisma/client";
const g=globalThis;
export const db=g.__prisma||(g.__prisma=new PrismaClient());
