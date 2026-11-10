import { PrismaClient } from "@prisma/client";

/**
 * Instancia a nivel de módulo, guardada en `globalThis` en desarrollo: Next
 * recarga módulos en cada cambio de archivo (HMR), así que sin esto cada
 * recarga crearía una instancia nueva de `PrismaClient` — cada una abre su
 * propio pool de conexiones, y Neon (como cualquier Postgres) tiene un
 * límite de conexiones simultáneas bajo. En producción no hace falta: el
 * proceso no se recarga en caliente.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
