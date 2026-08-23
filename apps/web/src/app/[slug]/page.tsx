import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { eq, sql } from "drizzle-orm";

import { db } from "@LinkTrim/db";
import { isBotUserAgent, parseDevice } from "@LinkTrim/db/lib/user-agent";
import { click, link } from "@LinkTrim/db/schema/links";

function firstForwardedIp(forwarded: string | null) {
  return forwarded?.split(",")[0]?.trim() || null;
}

export default async function SlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const [found] = await db
    .select()
    .from(link)
    .where(eq(link.slug, slug))
    .limit(1);

  if (!found || !found.isActive) notFound();

  if (found.expiresAt && found.expiresAt < new Date()) notFound();

  if (found.scheduledAt && found.scheduledAt > new Date()) notFound();

  const headersList = await headers();
  const ua = headersList.get("user-agent");
  const bot = isBotUserAgent(ua);

  // Geo lookup: CDN-provided country headers when available (Vercel,
  // Cloudflare), otherwise null — never guessed.
  const country =
    headersList.get("x-vercel-ip-country") ??
    headersList.get("cf-ipcountry");

  // Record the visit for every request (bots included, flagged as such)
  const writes: Promise<unknown>[] = [
    db.insert(click).values({
      linkId: found.id,
      ip:
        firstForwardedIp(headersList.get("x-forwarded-for")) ??
        headersList.get("x-real-ip"),
      userAgent: ua,
      referrer: headersList.get("referer"),
      isBot: bot,
      device: bot ? null : parseDevice(ua),
      country,
    }),
  ];

  // Bots are recorded but must not inflate the public click counter or
  // trigger the click cap. The increment is atomic in SQL so concurrent
  // clicks can never be lost; the cap is evaluated on the post-increment
  // value inside the same statement.
  if (!bot) {
    const capped = found.clickCap !== null;
    writes.push(
      db
        .update(link)
        .set({
          clickCount: sql`${link.clickCount} + 1`,
          ...(capped
            ? {
                isActive:
                  sql`CASE WHEN ${link.clickCount} + 1 >= ${found.clickCap} THEN false ELSE ${link.isActive} END`,
              }
            : {}),
        })
        .where(eq(link.id, found.id)),
    );
  }

  await Promise.all(writes);

  // @ts-expect-error — external URL, not a Next.js route
  redirect(found.originalUrl);
}
