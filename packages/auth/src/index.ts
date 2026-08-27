import { createDb } from "@LinkTrim/db";
import * as schema from "@LinkTrim/db/schema/auth";
import { env } from "@LinkTrim/env/server";
import { APIError, betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { organization } from "better-auth/plugins";

import { isReservedSlug, reservedSlugMessage } from "./reserved-slugs";


export function createAuth() {
  const db = createDb();

  return betterAuth({
    database: drizzleAdapter(db, {
      provider: "pg",

      schema: schema,
    }),
    trustedOrigins: [env.CORS_ORIGIN],
    emailAndPassword: {
      enabled: true,
    },
    socialProviders: {
      google: {
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
      },
    },
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL,
    account: {
      accountLinking: {
        enabled: true,
        trustedProviders: ["google"],
      },
    },
    plugins: [nextCookies(),
      organization({
        requireEmailVerificationOnInvitation: false,
        organizationHooks: {
          beforeCreateOrganization: async (data) => {
            const slug = data.organization.slug?.toLowerCase();
            if (slug && isReservedSlug(slug)) {
              throw new APIError("BAD_REQUEST", {
                message: reservedSlugMessage(slug),
              });
            }
          },
          beforeUpdateOrganization: async (data) => {
            const slug = data.organization.slug?.toLowerCase();
            if (slug && isReservedSlug(slug)) {
              throw new APIError("BAD_REQUEST", {
                message: reservedSlugMessage(slug),
              });
            }
          },
        },
      }),
    ],
  });
}

export const auth = createAuth();
