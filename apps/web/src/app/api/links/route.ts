import { desc, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import { auth } from "@LinkTrim/auth";
import { db } from "@LinkTrim/db";
import { user } from "@LinkTrim/db/schema/auth";
import { link } from "@LinkTrim/db/schema/links";

const SLUG_CHARS = "abcdefghijklmnopqrstuvwxyz0123456789";

const RESERVED_SLUGS = new Set([
  "login",
  "orgs",
  "api",
  "not-found",
  "manifest",
  "favicon",
  "_next",
  "admin",
  "dashboard",
  "settings",
  "profile",
  "account",
  "help",
  "support",
  "status",
  "docs",
  "terms",
  "privacy",
  "pricing",
  "about",
  "contact",
  "blog",
  "home",
  "index",
]);

function generateSlug(length = 8) {
  let result = "";
  for (let i = 0; i < length; i++) {
    result += SLUG_CHARS.charAt(Math.floor(Math.random() * SLUG_CHARS.length));
  }
  return result;
}

function isValidUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function isValidSlug(value: string) {
  return /^[a-z0-9][a-z0-9-]{0,48}[a-z0-9]$/.test(value);
}

type InsertLink = typeof link.$inferInsert;

function formatLink(l: typeof link.$inferSelect) {
  return {
    id: l.id,
    slug: l.slug,
    originalUrl: l.originalUrl,
    clickCount: l.clickCount,
    clickCap: l.clickCap,
    isActive: l.isActive,
    expiresAt: l.expiresAt?.toISOString() ?? null,
    scheduledAt: l.scheduledAt?.toISOString() ?? null,
    createdByUserId: l.createdById,
    createdAt: l.createdAt.toISOString(),
  };
}

async function tryInsert(
  data: InsertLink,
  userSlug?: string,
): Promise<NextResponse> {
  try {
    const [created] = await db.insert(link).values(data).returning();

    if (!created) {
      return NextResponse.json(
        { error: "Failed to create link" },
        { status: 500 },
      );
    }

    return NextResponse.json(formatLink(created), { status: 201 });
  } catch (error) {
    const pgError = error as { code?: string; constraint?: string };

    if (pgError.code === "23505") {
      if (userSlug) {
        return NextResponse.json(
          {
            error: "Slug already taken",
            slug: userSlug,
          },
          { status: 409 },
        );
      }

      return tryInsert({ ...data, slug: generateSlug() });
    }

    return NextResponse.json({ error: "Failed to create link" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { organizationSlug, originalUrl, clickCap, expiresAt, scheduledAt } =
    body as Record<string, unknown>;
  let slug = body.slug as string | undefined;

  if (!originalUrl || typeof originalUrl !== "string") {
    return NextResponse.json(
      { error: "originalUrl is required" },
      { status: 400 },
    );
  }

  if (!isValidUrl(originalUrl)) {
    return NextResponse.json(
      { error: "originalUrl must be a valid http or https URL" },
      { status: 400 },
    );
  }

  if (!organizationSlug || typeof organizationSlug !== "string") {
    return NextResponse.json(
      { error: "organizationSlug is required" },
      { status: 400 },
    );
  }

  if (slug !== undefined) {
    if (typeof slug !== "string" || !isValidSlug(slug)) {
      return NextResponse.json(
        {
          error:
            "slug must be 3-50 characters, lowercase alphanumeric with hyphens",
        },
        { status: 400 },
      );
    }

    if (RESERVED_SLUGS.has(slug)) {
      return NextResponse.json(
        { error: `"${slug}" is a reserved slug` },
        { status: 400 },
      );
    }
  } else {
    slug = generateSlug();
  }

  const organization = await auth.api
    .getFullOrganization({
      headers: request.headers,
      query: { organizationSlug },
    })
    .catch(() => null);

  if (!organization) {
    return NextResponse.json(
      { error: "Organization not found" },
      { status: 404 },
    );
  }

  const member = organization.members?.find(
    (m) => m.userId === session.user.id,
  );

  if (!member) {
    return NextResponse.json(
      { error: "You are not a member of this organization" },
      { status: 403 },
    );
  }

  const insertData: InsertLink = {
    organizationId: organization.id,
    createdById: session.user.id,
    slug,
    originalUrl,
    clickCount: 0,
    isActive: true,
  };

  if (clickCap !== undefined && clickCap !== null) {
    const parsed = Number(clickCap);
    if (!Number.isInteger(parsed) || parsed < 1) {
      return NextResponse.json(
        { error: "clickCap must be a positive integer" },
        { status: 400 },
      );
    }
    insertData.clickCap = parsed;
  }

  if (expiresAt) {
    const d = new Date(expiresAt as string);
    if (Number.isNaN(d.getTime())) {
      return NextResponse.json(
        { error: "expiresAt is not a valid date" },
        { status: 400 },
      );
    }
    insertData.expiresAt = d;
  }

  if (scheduledAt) {
    const d = new Date(scheduledAt as string);
    if (Number.isNaN(d.getTime())) {
      return NextResponse.json(
        { error: "scheduledAt is not a valid date" },
        { status: 400 },
      );
    }
    insertData.scheduledAt = d;
  }

  return tryInsert(insertData, body.slug as string | undefined);
}

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const organizationSlug = request.nextUrl.searchParams.get("organizationSlug");

  if (!organizationSlug) {
    return NextResponse.json(
      { error: "organizationSlug is required" },
      { status: 400 },
    );
  }

  const organization = await auth.api
    .getFullOrganization({
      headers: request.headers,
      query: { organizationSlug },
    })
    .catch(() => null);

  if (!organization) {
    return NextResponse.json(
      { error: "Organization not found" },
      { status: 404 },
    );
  }

  const member = organization.members?.find(
    (m) => m.userId === session.user.id,
  );

  if (!member) {
    return NextResponse.json(
      { error: "You are not a member of this organization" },
      { status: 403 },
    );
  }

  const rows = await db
    .select({
      id: link.id,
      slug: link.slug,
      originalUrl: link.originalUrl,
      clickCount: link.clickCount,
      clickCap: link.clickCap,
      isActive: link.isActive,
      expiresAt: link.expiresAt,
      scheduledAt: link.scheduledAt,
      createdById: link.createdById,
      createdByName: user.name,
      createdAt: link.createdAt,
    })
    .from(link)
    .leftJoin(user, eq(link.createdById, user.id))
    .where(eq(link.organizationId, organization.id))
    .orderBy(desc(link.createdAt));

  return NextResponse.json(
    rows.map((r) => ({
      id: r.id,
      slug: r.slug,
      originalUrl: r.originalUrl,
      clickCount: r.clickCount,
      clickCap: r.clickCap,
      isActive: r.isActive,
      expiresAt: r.expiresAt?.toISOString() ?? null,
      scheduledAt: r.scheduledAt?.toISOString() ?? null,
      createdByUserId: r.createdById,
      createdByName: r.createdByName,
      createdAt: r.createdAt.toISOString(),
    })),
  );
}
