import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import { auth } from "@LinkTrim/auth";
import { db } from "@LinkTrim/db";
import { link } from "@LinkTrim/db/schema/links";
import { isAdminRole } from "@/lib/roles";

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as Record<string, unknown>;
  const { organizationSlug, linkId } = body;

  if (!organizationSlug || typeof organizationSlug !== "string") {
    return NextResponse.json(
      { error: "organizationSlug is required" },
      { status: 400 },
    );
  }

  if (!linkId || typeof linkId !== "string") {
    return NextResponse.json({ error: "linkId is required" }, { status: 400 });
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

  if (!isAdminRole(member.role)) {
    const [existing] = await db
      .select({ createdById: link.createdById })
      .from(link)
      .where(and(eq(link.id, linkId), eq(link.organizationId, organization.id)))
      .limit(1);

    if (!existing) {
      return NextResponse.json({ error: "Link not found" }, { status: 404 });
    }

    if (existing.createdById !== session.user.id) {
      return NextResponse.json(
        { error: "Only the link creator or org admins can delete this link" },
        { status: 403 },
      );
    }
  }

  const [deleted] = await db
    .delete(link)
    .where(and(eq(link.id, linkId), eq(link.organizationId, organization.id)))
    .returning({ id: link.id });

  if (!deleted) {
    return NextResponse.json({ error: "Link not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
