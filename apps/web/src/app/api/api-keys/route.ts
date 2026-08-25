import { desc, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import { auth } from "@LinkTrim/auth";
import { db } from "@LinkTrim/db";
import { apiKey } from "@LinkTrim/db/schema/links";
import { generateApiKey } from "@LinkTrim/db/lib/api-keys";

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
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
  if (!member || member.role !== "owner") {
    return NextResponse.json(
      { error: "Only the organization owner can manage API keys" },
      { status: 403 },
    );
  }

  const rows = await db
    .select({
      id: apiKey.id,
      name: apiKey.name,
      prefix: apiKey.prefix,
      lastUsedAt: apiKey.lastUsedAt,
      expiresAt: apiKey.expiresAt,
      revokedAt: apiKey.revokedAt,
      createdAt: apiKey.createdAt,
    })
    .from(apiKey)
    .where(eq(apiKey.organizationId, organization.id))
    .orderBy(desc(apiKey.createdAt));

  return NextResponse.json(
    rows.map((r) => ({
      id: r.id,
      name: r.name,
      prefix: r.prefix,
      lastUsedAt: r.lastUsedAt?.toISOString() ?? null,
      expiresAt: r.expiresAt?.toISOString() ?? null,
      revokedAt: r.revokedAt?.toISOString() ?? null,
      createdAt: r.createdAt.toISOString(),
      createdByName: session.user.name,
    })),
  );
}

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { organizationSlug, name, expiresAt } = body as Record<string, unknown>;

  if (!organizationSlug || typeof organizationSlug !== "string") {
    return NextResponse.json(
      { error: "organizationSlug is required" },
      { status: 400 },
    );
  }

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return NextResponse.json(
      { error: "name is required" },
      { status: 400 },
    );
  }

  if (name.length > 100) {
    return NextResponse.json(
      { error: "name must be 100 characters or less" },
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
  if (!member || member.role !== "owner") {
    return NextResponse.json(
      { error: "Only the organization owner can manage API keys" },
      { status: 403 },
    );
  }

  const { plaintext, hashed, prefix } = generateApiKey();

  let parsedExpiresAt: Date | undefined;
  if (expiresAt) {
    const d = new Date(expiresAt as string);
    if (Number.isNaN(d.getTime())) {
      return NextResponse.json(
        { error: "expiresAt is not a valid date" },
        { status: 400 },
      );
    }
    if (d <= new Date()) {
      return NextResponse.json(
        { error: "expiresAt must be in the future" },
        { status: 400 },
      );
    }
    parsedExpiresAt = d;
  }

  const [created] = await db
    .insert(apiKey)
    .values({
      organizationId: organization.id,
      createdById: session.user.id,
      name: name.trim(),
      hashedKey: hashed,
      prefix,
      expiresAt: parsedExpiresAt,
    })
    .returning({
      id: apiKey.id,
      name: apiKey.name,
      prefix: apiKey.prefix,
      createdAt: apiKey.createdAt,
    });

  if (!created) {
    return NextResponse.json(
      { error: "Failed to create API key" },
      { status: 500 },
    );
  }

  return NextResponse.json(
    {
      id: created.id,
      name: created.name,
      prefix: created.prefix,
      key: plaintext,
      createdAt: created.createdAt.toISOString(),
    },
    { status: 201 },
  );
}

export async function DELETE(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { organizationSlug, keyId } = body as Record<string, unknown>;

  if (!organizationSlug || typeof organizationSlug !== "string") {
    return NextResponse.json(
      { error: "organizationSlug is required" },
      { status: 400 },
    );
  }

  if (!keyId || typeof keyId !== "string") {
    return NextResponse.json(
      { error: "keyId is required" },
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
  if (!member || member.role !== "owner") {
    return NextResponse.json(
      { error: "Only the organization owner can manage API keys" },
      { status: 403 },
    );
  }

  const [updated] = await db
    .update(apiKey)
    .set({ revokedAt: new Date() })
    .where(eq(apiKey.id, keyId))
    .returning({ id: apiKey.id });

  if (!updated) {
    return NextResponse.json({ error: "API key not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
