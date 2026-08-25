import { eq, inArray, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import { auth } from "@LinkTrim/auth";
import { db } from "@LinkTrim/db";
import { member, organization } from "@LinkTrim/db/schema/auth";

/**
 * Lists the session user's organizations with accurate member counts.
 *
 * Better Auth's /organization/list returns only the organization row
 * (the member record is stripped), so counts and the viewer's role must
 * come from our own tables.
 */
export async function GET(_req: NextRequest) {
  const session = await auth.api.getSession({
    headers: _req.headers,
  });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Organizations the user belongs to, including their role in each.
  const memberships = await db
    .select({
      id: organization.id,
      name: organization.name,
      slug: organization.slug,
      logo: organization.logo,
      createdAt: organization.createdAt,
      role: member.role,
    })
    .from(member)
    .innerJoin(organization, eq(member.organizationId, organization.id))
    .where(eq(member.userId, session.user.id))
    .orderBy(organization.createdAt);

  if (memberships.length === 0) {
    return NextResponse.json([]);
  }

  const counts = await db
    .select({
      organizationId: member.organizationId,
      count: sql<number>`count(*)::int`,
    })
    .from(member)
    .where(
      inArray(
        member.organizationId,
        memberships.map((m) => m.id),
      ),
    )
    .groupBy(member.organizationId);

  const countByOrg = new Map(counts.map((c) => [c.organizationId, c.count]));

  return NextResponse.json(
    memberships.map((m) => ({
      id: m.id,
      name: m.name,
      slug: m.slug,
      logo: m.logo,
      createdAt: m.createdAt.toISOString(),
      currentUserRole: m.role,
      memberCount: countByOrg.get(m.id) ?? 1,
    })),
  );
}
