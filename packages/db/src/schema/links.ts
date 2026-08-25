import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import { organization } from "./auth";
import { user } from "./auth";

export const link = pgTable(
  "link",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    createdById: text("created_by_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    slug: text("slug").notNull().unique(),
    originalUrl: text("original_url").notNull(),
    clickCount: integer("click_count").default(0).notNull(),
    clickCap: integer("click_cap"),
    isActive: boolean("is_active").default(true).notNull(),
    expiresAt: timestamp("expires_at"),
    scheduledAt: timestamp("scheduled_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("link_organizationId_idx").on(table.organizationId),
    index("link_createdById_idx").on(table.createdById),
  ],
);

export const click = pgTable(
  "click",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    linkId: text("link_id")
      .notNull()
      .references(() => link.id, { onDelete: "cascade" }),
    ip: text("ip"),
    userAgent: text("user_agent"),
    referrer: text("referrer"),
    // Bot visits are kept for auditing but excluded from all metrics and
    // never increment link.clickCount.
    isBot: boolean("is_bot").default(false).notNull(),
    // Parsed from the user agent at insert time so device breakdowns group
    // in SQL instead of re-parsing raw agents on every analytics request.
    // One of: Mobile, Tablet, Desktop, TV, Other (null for bots/unknown).
    device: text("device"),
    country: text("country"),
    timestamp: timestamp("timestamp").defaultNow().notNull(),
  },
  (table) => [
    index("click_linkId_idx").on(table.linkId),
    index("click_timestamp_idx").on(table.timestamp),
  ],
);

export const linkRelations = relations(link, ({ one, many }) => ({
  organization: one(organization, {
    fields: [link.organizationId],
    references: [organization.id],
  }),
  createdBy: one(user, {
    fields: [link.createdById],
    references: [user.id],
  }),
  clicks: many(click),
}));

export const clickRelations = relations(click, ({ one }) => ({
  link: one(link, {
    fields: [click.linkId],
    references: [link.id],
  }),
}));

export const apiKey = pgTable(
  "api_key",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    createdById: text("created_by_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    hashedKey: text("hashed_key").notNull().unique(),
    prefix: text("prefix").notNull(),
    lastUsedAt: timestamp("last_used_at"),
    expiresAt: timestamp("expires_at"),
    revokedAt: timestamp("revoked_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("apiKey_organizationId_idx").on(table.organizationId),
    index("apiKey_createdById_idx").on(table.createdById),
    uniqueIndex("apiKey_hashedKey_uidx").on(table.hashedKey),
  ],
);

export const apiKeyRelations = relations(apiKey, ({ one }) => ({
  organization: one(organization, {
    fields: [apiKey.organizationId],
    references: [organization.id],
  }),
  createdBy: one(user, {
    fields: [apiKey.createdById],
    references: [user.id],
  }),
}));
