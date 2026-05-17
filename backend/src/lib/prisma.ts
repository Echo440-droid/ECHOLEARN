import { PrismaClient } from '@prisma/client';

// Singleton pattern: prevents multiple Prisma instances during hot-reloading in dev.
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'warn', 'error'] : ['warn', 'error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// ─── Keep-Alive Heartbeat ───────────────────────
// Neon free tier suspends the database compute after ~5 min of inactivity.
// This heartbeat sends a lightweight query every 4 minutes to keep it warm.

const HEARTBEAT_INTERVAL_MS = 4 * 60 * 1000; // 4 minutes
let heartbeatTimer: ReturnType<typeof setInterval> | null = null;

export function startKeepAlive(): void {
  if (heartbeatTimer) return; // already running

  console.log('[DB KeepAlive] Starting heartbeat (every 4 min)');

  heartbeatTimer = setInterval(async () => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      console.log('[DB KeepAlive] Heartbeat OK');
    } catch (err) {
      console.warn('[DB KeepAlive] Heartbeat failed:', (err as Error).message);
    }
  }, HEARTBEAT_INTERVAL_MS);

  // Don't let this timer keep Node.js alive when shutting down
  if (heartbeatTimer && typeof heartbeatTimer === 'object' && 'unref' in heartbeatTimer) {
    heartbeatTimer.unref();
  }
}

export function stopKeepAlive(): void {
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer);
    heartbeatTimer = null;
    console.log('[DB KeepAlive] Stopped heartbeat');
  }
}

// ─── DB Warm-Up ─────────────────────────────────
// Call on server startup to wake the database and verify connectivity.

export async function warmUpDatabase(): Promise<void> {
  const MAX_RETRIES = 5;
  const BASE_DELAY_MS = 2000;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      await prisma.$queryRaw`SELECT 1`;
      console.log('[DB] Connection verified (warm-up OK)');
      return;
    } catch (err) {
      const delay = BASE_DELAY_MS * Math.pow(2, attempt - 1); // 2s, 4s, 8s, 16s, 32s
      console.warn(
        `[DB] Warm-up attempt ${attempt}/${MAX_RETRIES} failed: ${(err as Error).message}`
      );
      if (attempt < MAX_RETRIES) {
        console.log(`[DB] Retrying in ${delay / 1000}s…`);
        await new Promise((r) => setTimeout(r, delay));
      } else {
        console.error('[DB] All warm-up attempts failed. The database may be unreachable.');
      }
    }
  }
}

// ─── Resilient Query Helper ─────────────────────
// Wraps any async DB call with automatic retry + exponential backoff.
// Use this for critical queries that must survive a cold-start wake.

export async function withRetry<T>(
  fn: () => Promise<T>,
  { maxRetries = 3, baseDelayMs = 1000, label = 'DB query' } = {}
): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      const isConnectionError =
        err?.code === 'P6008' ||
        err?.message?.includes("Can't reach database server") ||
        err?.message?.includes('Connection refused') ||
        err?.message?.includes('connect ETIMEDOUT');

      if (isConnectionError && attempt < maxRetries) {
        const delay = baseDelayMs * Math.pow(2, attempt - 1);
        console.warn(
          `[DB Retry] ${label} — attempt ${attempt}/${maxRetries} failed (connection error). Retrying in ${delay / 1000}s…`
        );
        await new Promise((r) => setTimeout(r, delay));
      } else {
        throw err; // not a connection error, or out of retries
      }
    }
  }
  // TypeScript: unreachable but satisfies the compiler
  throw new Error(`[DB Retry] ${label} — exhausted all ${maxRetries} retries`);
}

// ─── Graceful Shutdown ──────────────────────────

process.on('SIGINT', async () => {
  stopKeepAlive();
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  stopKeepAlive();
  await prisma.$disconnect();
  process.exit(0);
});
