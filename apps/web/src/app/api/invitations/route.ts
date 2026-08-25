import { eq, and } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import { auth } from "@LinkTrim/auth";
import { db } from "@LinkTrim/db";
import { invitation, organization } from "@LinkTrim/db/schema/auth";

export async function GET(_req: NextRequest) {
  const session = await auth.api.getSession({
    headers: _req.headers,
  });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rows = await db
    .select({
      id: invitation.id,
      organizationId: invitation.organizationId,
      email: invitation.email,
      role: invitation.role,
      status: invitation.status,
      expiresAt: invitation.expiresAt,
      createdAt: invitation.createdAt,
      inviterId: invitation.inviterId,
      organizationName: organization.name,
      organizationSlug: organization.slug,
    })
    .from(invitation)
    .innerJoin(organization, eq(invitation.organizationId, organization.id))
    .where(
      and(
        eq(invitation.email, session.user.email.toLowerCase()),
        eq(invitation.status, "pending"),
      ),
    );

  return NextResponse.json(rows);
}
