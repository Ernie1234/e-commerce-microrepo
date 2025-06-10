// lib/prismadb.ts
import { PrismaClient } from '@prisma/client';

// Extend the globalThis interface directly.
// This is the correct way to add properties to the global object's type definition.
declare global {
  // eslint-disable-next-line no-var
  var prismadb: PrismaClient | undefined;
}

// Check if a global PrismaClient instance already exists, otherwise create a new one.
// The `globalThis.prismadb` is now correctly typed thanks to the `declare global` block.
const prismaClient = globalThis.prismadb || new PrismaClient();

// In development, store the PrismaClient instance globally to prevent
// multiple instances due to hot-reloading (which can lead to too many database connections).
if (process.env.NODE_ENV !== 'production') {
  globalThis.prismadb = prismaClient;
}

export default prismaClient;
