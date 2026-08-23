import { and, desc, eq, gte, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import { auth } from "@LinkTrim/auth";
import { db } from "@LinkTrim/db";
import { click, link } from "@LinkTrim/db/schema/links";
import type {
  CountrySlice,
  DaySlice,
  DeviceSlice,
  HourSlice,
  LinkAnalytics,
  OrgAnalytics,
  RecentClickSlice,
  ReferrerSlice,
  WeekdaySlice,
} from "@/types/analytics";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
const DAYS_OF_HISTORY = 30;

// Bots are recorded for auditing but excluded from every analytics figure.
const notBot = eq(click.isBot, false);

/** Normalizes a stored referrer URL to a bare host (or "Direct"). */
const referrerHost = sql<string>`CASE
  WHEN ${click.referrer} IS NULL OR ${click.referrer} = '' THEN 'Direct'
  ELSE split_part(split_part(regexp_replace(${click.referrer}, '^https?://', ''), '/', 1), '?', 1)
END`;

/** Fills gaps so the timeseries always spans a continuous range ending today. */
function fillDailyDays(rows: { date: string; clicks: number }[]): DaySlice[] {
  const byDate = new Map(rows.map((r) => [r.date, r.clicks]));
  const out: DaySlice[] = [];
  const end = new Date();
  for (let i = DAYS_OF_HISTORY - 1; i >= 0; i--) {
    const d = new Date(end.getTime() - i * 86_400_000);
    const key = d.toISOString().slice(0, 10);
    out.push({ date: key, clicks: byDate.get(key) ?? 0 });
  }
  return out;
}

async function fetchTotals(where: ReturnType<typeof and>) {
  const [row] = await db
    .select({
      totalClicks: sql<number>`count(*) filter (where ${notBot})::int`,
      uniqueClicks: sql<number>`count(distinct ${click.ip}) filter (where ${notBot} and ${click.ip} is not null)::int`,
      botClicks: sql<number>`count(*) filter (where ${click.isBot})::int`,
    })
    .from(click)
    .innerJoin(link, eq(click.linkId, link.id))
    .where(where);
  return (
    row ?? {
      totalClicks: 0,
      uniqueClicks: 0,
      botClicks: 0,
    }
  );
}

async function fetchDevices(where: ReturnType<typeof and>): Promise<DeviceSlice[]> {
  return db
    .select({
      device: sql<string>`coalesce(${click.device}, 'Unknown')`,
      clicks: sql<number>`count(*)::int`,
    })
    .from(click)
    .innerJoin(link, eq(click.linkId, link.id))
    .where(and(where, notBot))
    .groupBy(sql`coalesce(${click.device}, 'Unknown')`)
    .orderBy(desc(sql`count(*)`));
}

async function fetchHourly(where: ReturnType<typeof and>): Promise<HourSlice[]> {
  const rows = await db
    .select({
      hour: sql<number>`extract(hour from ${click.timestamp})::int`,
      clicks: sql<number>`count(*)::int`,
    })
    .from(click)
    .innerJoin(link, eq(click.linkId, link.id))
    .where(and(where, notBot))
    .groupBy(sql`extract(hour from ${click.timestamp})`);

  const byHour = new Map(rows.map((r) => [r.hour, r.clicks]));
  return Array.from({ length: 24 }, (_, h) => ({
    hour: String(h).padStart(2, "0"),
    clicks: byHour.get(h) ?? 0,
  }));
}

async function fetchWeekly(where: ReturnType<typeof and>): Promise<WeekdaySlice[]> {
  const rows = await db
    .select({
      dow: sql<number>`extract(dow from ${click.timestamp})::int`,
      clicks: sql<number>`count(*)::int`,
    })
    .from(click)
    .innerJoin(link, eq(click.linkId, link.id))
    .where(and(where, notBot))
    .groupBy(sql`extract(dow from ${click.timestamp})`);

  const byDow = new Map(rows.map((r) => [r.dow, r.clicks]));
  // Present Monday-first to match the weekly chart labels
  const order = [1, 2, 3, 4, 5, 6, 0];
  return order.map((dow) => ({
    day: WEEKDAYS[dow],
    clicks: byDow.get(dow) ?? 0,
  }));
}

async function fetchDaily(
  where: ReturnType<typeof and>,
  since: Date,
): Promise<DaySlice[]> {
  const rows = await db
    .select({
      date: sql<string>`to_char(date_trunc('day', ${click.timestamp}), 'YYYY-MM-DD')`,
      clicks: sql<number>`count(*)::int`,
    })
    .from(click)
    .innerJoin(link, eq(click.linkId, link.id))
    .where(and(where, notBot, gte(click.timestamp, since)))
    .groupBy(sql`date_trunc('day', ${click.timestamp})`)
    .orderBy(sql`date_trunc('day', ${click.timestamp})`);

  // Clamp anything older than the window (defensive) then fill gaps
  const cutoff = new Date(Date.now() - DAYS_OF_HISTORY * 86_400_000)
    .toISOString()
    .slice(0, 10);
  return fillDailyDays(rows.filter((r) => r.date >= cutoff));
}

async function fetchReferrers(
  where: ReturnType<typeof and>,
): Promise<ReferrerSlice[]> {
  const rows = await db
    .select({
      referrer: referrerHost,
      clicks: sql<number>`count(*)::int`,
    })
    .from(click)
    .innerJoin(link, eq(click.linkId, link.id))
    .where(and(where, notBot))
    .groupBy(referrerHost)
    .orderBy(desc(sql`count(*)`))
    .limit(8);
  return rows;
}

async function fetchCountries(
  where: ReturnType<typeof and>,
): Promise<CountrySlice[]> {
  return db
    .select({
      country: sql<string>`coalesce(${click.country}, 'Unknown')`,
      clicks: sql<number>`count(*)::int`,
    })
    .from(click)
    .innerJoin(link, eq(click.linkId, link.id))
    .where(and(where, notBot))
    .groupBy(sql`coalesce(${click.country}, 'Unknown')`)
    .orderBy(desc(sql`count(*)`))
    .limit(8);
}

async function fetchRecentClicks(linkId: string): Promise<RecentClickSlice[]> {
  const rows = await db
    .select({
      id: click.id,
      timestamp: click.timestamp,
      country: click.country,
      device: click.device,
      referrer: click.referrer,
      isBot: click.isBot,
    })
    .from(click)
    .where(eq(click.linkId, linkId))
    .orderBy(desc(click.timestamp))
    .limit(10);

  return rows.map((r) => ({
    id: r.id,
    timestamp: r.timestamp.toISOString(),
    country: r.country,
    device: r.device,
    referrer: r.referrer,
    isBot: r.isBot,
  }));
}

async function getOrgAnalytics(organizationId: string): Promise<OrgAnalytics> {
  const orgWhere = eq(link.organizationId, organizationId);
  const since = new Date(Date.now() - DAYS_OF_HISTORY * 86_400_000);

  const [totals, devices, daily, referrers, countries] = await Promise.all([
    fetchTotals(orgWhere),
    fetchDevices(orgWhere),
    fetchDaily(orgWhere, since),
    fetchReferrers(orgWhere),
    fetchCountries(orgWhere),
  ]);

  const [counts] = await db
    .select({
      linkCount: sql<number>`count(*)::int`,
      activeLinkCount: sql<number>`count(*) filter (where ${link.isActive})::int`,
    })
    .from(link)
    .where(orgWhere);

  const topLinks = await db
    .select({
      id: link.id,
      slug: link.slug,
      originalUrl: link.originalUrl,
      clickCount: link.clickCount,
    })
    .from(link)
    .where(orgWhere)
    .orderBy(desc(link.clickCount))
    .limit(5);

  return {
    totalClicks: totals.totalClicks,
    uniqueClicks: totals.uniqueClicks,
    botClicks: totals.botClicks,
    linkCount: counts?.linkCount ?? 0,
    activeLinkCount: counts?.activeLinkCount ?? 0,
    daily,
    devices,
    referrers,
    countries,
    topLinks,
  };
}

async function getLinkAnalyticsData(
  organizationId: string,
  linkId: string,
): Promise<LinkAnalytics | null> {
  const [found] = await db
    .select({ id: link.id })
    .from(link)
    .where(and(eq(link.id, linkId), eq(link.organizationId, organizationId)))
    .limit(1);

  if (!found) return null;

  const linkWhere = and(eq(click.linkId, linkId), eq(link.organizationId, organizationId));
  const since = new Date(Date.now() - DAYS_OF_HISTORY * 86_400_000);

  const [totals, hourly, weekly] = await Promise.all([
    fetchTotals(linkWhere),
    fetchHourly(linkWhere),
    fetchWeekly(linkWhere),
  ]);

  const [devices, daily, referrers, countries, recent] = await Promise.all([
    fetchDevices(linkWhere),
    fetchDaily(linkWhere, since),
    fetchReferrers(linkWhere),
    fetchCountries(linkWhere),
    fetchRecentClicks(found.id),
  ]);

  return {
    linkId: found.id,
    totalClicks: totals.totalClicks,
    uniqueClicks: totals.uniqueClicks,
    botClicks: totals.botClicks,
    devices,
    hourly,
    weekly,
    daily,
    referrers,
    countries,
    recent,
  };
}

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const params = request.nextUrl.searchParams;
  const organizationSlug = params.get("organizationSlug");
  const linkId = params.get("linkId");

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

  try {
    if (linkId) {
      const data = await getLinkAnalyticsData(organization.id, linkId);
      if (!data) {
        return NextResponse.json({ error: "Link not found" }, { status: 404 });
      }
      return NextResponse.json(data);
    }

    return NextResponse.json(await getOrgAnalytics(organization.id));
  } catch {
    return NextResponse.json(
      { error: "Failed to load analytics" },
      { status: 500 },
    );
  }
}
