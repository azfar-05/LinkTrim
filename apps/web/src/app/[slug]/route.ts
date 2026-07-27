import { NextRequest, NextResponse } from "next/server";

import { db } from "@LinkTrim/db";
import { click, link } from "@LinkTrim/db/schema/links";
import { eq } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  const [found] = await db
    .select()
    .from(link)
    .where(eq(link.slug, slug))
    .limit(1);

  if (!found) {
    return NextResponse.json({ error: "Link not found" }, { status: 404 });
  }

  if (!found.isActive) {
    return NextResponse.json({ error: "Link disabled" }, { status: 410 });
  }

  if (found.expiresAt && found.expiresAt < new Date()) {
    return NextResponse.json({ error: "Link expired" }, { status: 410 });
  }

  if (found.scheduledAt && found.scheduledAt > new Date()) {
    return NextResponse.json({ error: "Link not yet active" }, { status: 404 });
  }

  const ua = request.headers.get("user-agent") ?? "";
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");

  const insertClick = db.insert(click).values({
    linkId: found.id,
    ip: forwarded?.split(",")[0]?.trim() ?? realIp ?? "unknown",
    userAgent: ua,
    referrer: request.headers.get("referer") ?? "",
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

  return NextResponse.redirect(new URL(found.originalUrl));
}
