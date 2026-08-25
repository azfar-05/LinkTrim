import { createHash } from "crypto";
import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";

import { auth } from "@LinkTrim/auth";
import { db } from "@LinkTrim/db";
import { organization, member } from "@LinkTrim/db/schema/auth";
import { apiKey } from "@LinkTrim/db/schema/links";

type AuthResult =
  | { kind: "session"; userId: string; organizationId: string }
  | { kind: "api-key"; userId: string; organizationId: string; keyId: string }
  | null;

function extractBearerToken(headers: Headers): string | null {
  const authHeader = headers.get("authorization");
  if (!authHeader) return null;

  const [scheme, token] = authHeader.split(" ", 2);
  if (scheme?.toLowerCase() !== "bearer" || !token) return null;

  return token;
}

export async function resolveAuth(
  request: NextRequest,
  organizationSlug: string,
): Promise<AuthResult> {
  const token = extractBearerToken(request.headers);

  if (token && token.startsWith("lt_")) {
    const hashed = createHash("sha256").update(token).digest("hex");

    const [key] = await db
      .select({
        id: apiKey.id,
        organizationId: apiKey.organizationId,
        createdById: apiKey.createdById,
        expiresAt: apiKey.expiresAt,
        revokedAt: apiKey.revokedAt,
      })
      .from(apiKey)
      .where(eq(apiKey.hashedKey, hashed))
      .limit(1);

    if (!key) return null;
    if (key.revokedAt) return null;
    if (key.expiresAt && key.expiresAt < new Date()) return null;

    // Verify the org exists and the slug matches (no session needed)
    const [org] = await db
      .select({ id: organization.id })
      .from(organization)
      .where(eq(organization.slug, organizationSlug))
      .limit(1);

    if (!org || org.id !== key.organizationId) return null;

    // Verify the key creator is still a member of the org
    const [m] = await db
      .select({ userId: member.userId })
      .from(member)
      .where(eq(member.userId, key.createdById))
      .limit(1);

    if (!m) return null;

    // Update lastUsedAt (fire and forget)
    db.update(apiKey)
      .set({ lastUsedAt: new Date() })
      .where(eq(apiKey.id, key.id))
      .execute()
      .catch(() => {});

    return {
      kind: "api-key",
      userId: key.createdById,
      organizationId: key.organizationId,
      keyId: key.id,
    };
  }

  // Fall back to session auth
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) return null;

  return {
    kind: "session",
    userId: session.user.id,
    organizationId: "",
  };
}
