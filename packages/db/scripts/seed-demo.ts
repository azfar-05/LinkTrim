import dotenv from "dotenv";

dotenv.config({ path: "../../apps/web/.env" });

const { createDb } = await import("@LinkTrim/db");
const {
  user,
  organization,
  member,
  invitation,
} = await import("@LinkTrim/db/schema/auth");
const { link, click } = await import("@LinkTrim/db/schema/links");
const { eq, inArray } = await import("drizzle-orm");

const db = createDb();

const DEMO_ORG_NAME = "demo_org";
const DEMO_ORG_SLUG = "demo-org";
const DAY = 86_400_000;

function log(msg: string) {
  console.log(`[seed] ${msg}`);
}

function randomId() {
  return crypto.randomUUID();
}

// ─────────────────────────────────────────────────────────────────────────────
// Owner resolution — pass your email as argv[2], else the first user
// ─────────────────────────────────────────────────────────────────────────────

const ownerEmail = process.argv[2]?.trim().toLowerCase();

let owner = ownerEmail
  ? (await db.select().from(user).where(eq(user.email, ownerEmail)).limit(1))[0]
  : undefined;

if (!owner) {
  const first = (await db.select().from(user).limit(1))[0];
  if (!first) {
    console.error(
      "[seed] No users found. Sign up first, or pass your email: bun run db:seed you@example.com",
    );
    process.exit(1);
  }
  owner = first;
  if (ownerEmail) {
    log(`User "${ownerEmail}" not found — falling back to "${first.email}"`);
  }
}

log(`Owner: ${owner.email}`);

// ─────────────────────────────────────────────────────────────────────────────
// Reset any existing demo org (FK cascades clean up links, clicks, members)
// ─────────────────────────────────────────────────────────────────────────────

const existingOrg = (
  await db
    .select({ id: organization.id })
    .from(organization)
    .where(eq(organization.slug, DEMO_ORG_SLUG))
    .limit(1)
)[0];

if (existingOrg) {
  await db.delete(organization).where(eq(organization.id, existingOrg.id));
  log(`Removed previous "${DEMO_ORG_NAME}" (members, links, clicks cascaded)`);
}

// ─────────────────────────────────────────────────────────────────────────────
// Demo users (created once; never log in — they only flesh out the member list)
// ─────────────────────────────────────────────────────────────────────────────

const now = new Date();

const DEMO_USERS = [
  { name: "Alex Rivera", email: "alex@demo.linktrim.dev", role: "admin", joinedDaysAfter: 5 },
  { name: "Sam Chen", email: "sam@demo.linktrim.dev", role: "member", joinedDaysAfter: 12 },
  { name: "Priya Nair", email: "priya@demo.linktrim.dev", role: "member", joinedDaysAfter: 19 },
];

const demoUserIds: Record<string, string> = {};

for (const du of DEMO_USERS) {
  let row = (
    await db.select().from(user).where(eq(user.email, du.email)).limit(1)
  )[0];
  if (!row) {
    const id = randomId();
    await db.insert(user).values({
      id,
      name: du.name,
      email: du.email,
      emailVerified: true,
      createdAt: new Date(now.getTime() - 21 * DAY),
      updatedAt: now,
    });
    row = { id } as typeof user.$inferSelect;
    log(`Created demo user ${du.name} <${du.email}>`);
  }
  demoUserIds[du.name] = row.id;
}

// ─────────────────────────────────────────────────────────────────────────────
// Demo org + members + pending invitation
// ─────────────────────────────────────────────────────────────────────────────

const orgCreatedAt = new Date(now.getTime() - 45 * DAY);
const orgId = randomId();

await db.insert(organization).values({
  id: orgId,
  name: DEMO_ORG_NAME,
  slug: DEMO_ORG_SLUG,
  createdAt: orgCreatedAt,
});

await db.insert(member).values([
  {
    id: randomId(),
    organizationId: orgId,
    userId: owner.id,
    role: "owner",
    createdAt: orgCreatedAt,
  },
  ...DEMO_USERS.map((du) => ({
    id: randomId(),
    organizationId: orgId,
    userId: demoUserIds[du.name]!,
    role: du.role,
    createdAt: new Date(orgCreatedAt.getTime() + du.joinedDaysAfter * DAY),
  })),
]);

await db.insert(invitation).values({
  id: randomId(),
  organizationId: orgId,
  email: "jordan@demo.linktrim.dev",
  role: "member",
  status: "pending",
  expiresAt: new Date(now.getTime() + 7 * DAY),
  createdAt: now,
  inviterId: owner.id,
});

log(`Created org "${DEMO_ORG_NAME}" (/${DEMO_ORG_SLUG}) with 4 members + 1 pending invitation`);

// ─────────────────────────────────────────────────────────────────────────────
// Links — varied click counts, lifecycles, and creators
// ─────────────────────────────────────────────────────────────────────────────

type LinkSeed = {
  slug: string;
  url: string;
  clicks: number;
  createdBy: string;
  createdDaysAgo: number;
  clickCap?: number;
  expiresInDays?: number;
  scheduledInDays?: number;
  isActive?: boolean;
};

const LINK_SEEDS: LinkSeed[] = [
  { slug: "summer-launch", url: "https://stripe.com/pricing", clicks: 12847, createdBy: "Sam Chen", createdDaysAgo: 40, clickCap: 20000 },
  { slug: "launch-week", url: "https://vercel.com/blog", clicks: 8923, createdBy: "Alex Rivera", createdDaysAgo: 6 },
  { slug: "abc123f", url: "https://notion.so/templates", clicks: 4561, createdBy: "Priya Nair", createdDaysAgo: 20 },
  { slug: "old-promo", url: "https://example.com/spring-sale", clicks: 2154, createdBy: "Sam Chen", createdDaysAgo: 60, expiresInDays: -14 },
  { slug: "deal-page", url: "https://github.com/vercel/next.js", clicks: 1892, createdBy: "Alex Rivera", createdDaysAgo: 28 },
  { slug: "internal-note", url: "https://linear.app/roadmap", clicks: 312, createdBy: owner.email, createdDaysAgo: 12 },
  { slug: "coming-soon", url: "https://example.com/preorder", clicks: 0, createdBy: owner.email, createdDaysAgo: 2, scheduledInDays: 2 },
];

const demoSlugs = LINK_SEEDS.map((l) => l.slug);
const takenSlugs = (
  await db
    .select({ slug: link.slug })
    .from(link)
    .where(inArray(link.slug, demoSlugs))
).map((r) => r.slug);

const linkIds: Record<string, string> = {};

for (const ls of LINK_SEEDS) {
  if (takenSlugs.includes(ls.slug)) {
    log(`SKIP ${ls.slug} — a link with this slug already exists`);
    continue;
  }
  const id = randomId();
  linkIds[ls.slug] = id;
  await db.insert(link).values({
    id,
    organizationId: orgId,
    createdById: demoUserIds[ls.createdBy] ?? owner.id,
    slug: ls.slug,
    originalUrl: ls.url,
    clickCount: ls.clicks,
    clickCap: ls.clickCap,
    isActive: ls.isActive ?? true,
    expiresAt:
      ls.expiresInDays !== undefined
        ? new Date(now.getTime() + ls.expiresInDays * DAY)
        : undefined,
    scheduledAt:
      ls.scheduledInDays !== undefined
        ? new Date(now.getTime() + ls.scheduledInDays * DAY)
        : undefined,
    createdAt: new Date(now.getTime() - ls.createdDaysAgo * DAY),
  });
}

log(
  `Created ${Object.keys(linkIds).length} links: ${Object.keys(linkIds).join(", ")}`,
);

// ─────────────────────────────────────────────────────────────────────────────
// Click rows — one row per recorded click, spread realistically across the
// link's lifetime (weekdays > weekends, business hours, varied devices)
// ─────────────────────────────────────────────────────────────────────────────

const UA_POOL: { w: number; ua: string; bot: boolean }[] = [
  { w: 0.5, ua: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36", bot: false },
  { w: 0.18, ua: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36", bot: false },
  { w: 0.22, ua: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1", bot: false },
  { w: 0.12, ua: "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36", bot: false },
  { w: 0.08, ua: "Mozilla/5.0 (iPad; CPU OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1", bot: false },
  { w: 0.04, ua: "Mozilla/5.0 (SMART-TV; Linux; Tizen 6.5) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/6.5 TV Safari/537.36", bot: false },
  { w: 0.03, ua: "Googlebot/2.1 (+http://www.google.com/bot.html)", bot: true },
];

const COUNTRY_POOL: { w: number; c: string | null }[] = [
  { w: 0.3, c: "US" },
  { w: 0.15, c: "IN" },
  { w: 0.1, c: "DE" },
  { w: 0.1, c: "GB" },
  { w: 0.08, c: "BR" },
  { w: 0.07, c: "JP" },
  { w: 0.06, c: "FR" },
  { w: 0.05, c: "CA" },
  { w: 0.04, c: "AU" },
  { w: 0.03, c: "NL" },
  { w: 0.02, c: "SG" },
  { w: 0.02, c: "SE" },
  { w: 0.02, c: "ES" },
  { w: 0.01, c: null },
];

const REFERRER_POOL: { w: number; r: string }[] = [
  { w: 0.35, r: "https://www.google.com" },
  { w: 0.25, r: "" },
  { w: 0.1, r: "https://x.com" },
  { w: 0.08, r: "https://www.linkedin.com" },
  { w: 0.07, r: "https://github.com" },
  { w: 0.05, r: "https://www.reddit.com" },
  { w: 0.05, r: "https://news.ycombinator.com" },
  { w: 0.05, r: "https://mail.google.com" },
];

function weighted<T>(pool: { w: number; v: T }[]): T {
  const total = pool.reduce((s, p) => s + p.w, 0);
  let r = Math.random() * total;
  for (const p of pool) {
    r -= p.w;
    if (r <= 0) return p.v;
  }
  return pool[pool.length - 1]!.v;
}

function randomIp() {
  return `${1 + Math.floor(Math.random() * 222)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${2 + Math.floor(Math.random() * 253)}`;
}

function pickTimestamp(start: number, end: number) {
  const daysSince = Math.max(1, Math.floor((end - start) / DAY));
  const dayOff = Math.floor(Math.random() * daysSince);
  const d = new Date(start + dayOff * DAY);
  const dow = d.getDay();
  if ((dow === 0 || dow === 6) && Math.random() < 0.55) {
    const weekday = start + (dayOff + Math.random() < 0.5 ? -1 : 1) * DAY;
    d.setTime(Math.min(end - DAY, Math.max(start, weekday)));
  }
  const r = Math.random();
  const hour =
    r < 0.62 ? 9 + Math.floor(Math.random() * 9) : r < 0.86 ? 18 + Math.floor(Math.random() * 5) : Math.floor(Math.random() * 9);
  return new Date(
    d.getTime() + hour * 3_600_000 + Math.floor(Math.random() * 3_600_000),
  );
}

let totalClicks = 0;

for (const ls of LINK_SEEDS) {
  const id = linkIds[ls.slug];
  if (!id || ls.clicks === 0) continue;

  const start = new Date(now.getTime() - ls.createdDaysAgo * DAY).getTime();
  const rows: (typeof click.$inferInsert)[] = [];

  for (let i = 0; i < ls.clicks; i++) {
    const pick = weighted(UA_POOL.map((p) => ({ w: p.w, v: p })));
    const country = pick.bot ? "US" : weighted(COUNTRY_POOL.map((p) => ({ w: p.w, v: p.c })));
    const referrer = weighted(REFERRER_POOL.map((p) => ({ w: p.w, v: p.r })));
    rows.push({
      linkId: id,
      ip: pick.bot ? `66.249.${Math.floor(Math.random() * 255)}.${2 + Math.floor(Math.random() * 253)}` : randomIp(),
      userAgent: pick.ua,
      referrer,
      isBot: pick.bot,
      country,
      timestamp: pickTimestamp(start, now.getTime()),
    });

    if (rows.length >= 1000) {
      await db.insert(click).values(rows);
      rows.length = 0;
    }
  }
  if (rows.length > 0) await db.insert(click).values(rows);

  totalClicks += ls.clicks;
  log(`Seeded ${ls.clicks.toLocaleString()} clicks for /${ls.slug}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// Summary
// ─────────────────────────────────────────────────────────────────────────────

log("────────────── done ──────────────");
log(`Org:   /${DEMO_ORG_SLUG} (${DEMO_ORG_NAME}) — owner: ${owner.email}`);
log(`Links: ${Object.keys(linkIds).join(", ")}`);
log(`Clicks: ${totalClicks.toLocaleString()} rows across ${Object.keys(linkIds).length} links`);
log("Next: open http://localhost:3001/orgs/demo-org in your browser.");
log("Tip: visiting /summer-launch, /launch-week etc. redirects and records live clicks.");
