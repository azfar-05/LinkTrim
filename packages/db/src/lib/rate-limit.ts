import { eq, and, gte, sql } from "drizzle-orm";
import { db } from "@LinkTrim/db";
import { rateLimit } from "@LinkTrim/db/schema/links";

const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 30;

export async function checkRateLimit(
  keyId: string,
): Promise<{ allowed: boolean; remaining: number }> {
  const windowStart = new Date(Date.now() - WINDOW_MS);

  const [row] = await db
    .select({ count: rateLimit.count })
    .from(rateLimit)
    .where(
      and(
        eq(rateLimit.keyId, keyId),
        gte(rateLimit.windowStart, windowStart),
      ),
    )
    .limit(1);

  if (row && row.count >= MAX_REQUESTS) {
    return { allowed: false, remaining: 0 };
  }

  // Upsert: increment if window exists, create if not
  if (row) {
    await db
      .update(rateLimit)
      .set({ count: row.count + 1 })
      .where(eq(rateLimit.keyId, keyId));
  } else {
    await db.insert(rateLimit).values({
      keyId,
      windowStart: new Date(),
      count: 1,
    });
  }

  return { allowed: true, remaining: MAX_REQUESTS - (row?.count ?? 0) - 1 };
}
