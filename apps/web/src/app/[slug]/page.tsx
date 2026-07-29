import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { db } from "@LinkTrim/db";
import { click, link } from "@LinkTrim/db/schema/links";
import { eq } from "drizzle-orm";

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
  const ua = headersList.get("user-agent") ?? "";
  const forwarded = headersList.get("x-forwarded-for");
  const realIp = headersList.get("x-real-ip");

  const insertClick = db.insert(click).values({
    linkId: found.id,
    ip: forwarded?.split(",")[0]?.trim() ?? realIp ?? "unknown",
    userAgent: ua,
    referrer: headersList.get("referer") ?? "",
    timestamp: new Date(),
  });

  const updateCount = db
    .update(link)
    .set({
      clickCount: found.clickCount + 1,
      ...(found.clickCap !== null && found.clickCount + 1 >= found.clickCap
        ? { isActive: false }
        : {}),
    })
    .where(eq(link.id, found.id));

  await Promise.all([insertClick, updateCount]);

  // @ts-expect-error — external URL, not a Next.js route
  redirect(found.originalUrl);
}
