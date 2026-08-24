"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BarChart2,
  ExternalLink,
  Eye,
  Link2,
  Loader2,
  ShieldCheck,
} from "lucide-react";

import { Button } from "@LinkTrim/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@LinkTrim/ui/components/card";
import { useOrganization } from "@/context/organization-context";
import { authClient } from "@/lib/auth-client";
import { isAdminRole } from "@/lib/roles";
import AnalyticsCharts, {
  ClicksOverTimeCard,
  CountriesCard,
  DeviceBreakdownCard,
  ReferrersCard,
  StatCard,
} from "@/components/analytics-charts";
import { CopyButton } from "@/components/copy-button";
import { getLinkStatus, StatusBadge } from "@/components/status-badge";
import { useAnalytics } from "@/hooks/use-analytics";
import { useOrgLinks } from "@/hooks/use-org-links";
import type {
  LinkAnalytics,
  OrgAnalytics,
} from "@/types/analytics";
import type { LinkRow } from "@/types/links";

export default function AnalyticsPage() {
  const org = useOrganization();
  const { data: session } = authClient.useSession();
  const { links } = useOrgLinks(org.slug);
  const [selectedLinkId, setSelectedLinkId] = useState<string | null>(null);

  // Analytics visibility rule: owners/admins see every link's analytics,
  // regular members only links they created. Mirrors server-side enforcement.
  const canSeeAll = isAdminRole(
    org.members?.find((m) => m.userId === session?.user?.id)?.role ?? "",
  );
  const viewableLinks = canSeeAll
    ? links
    : links.filter((l) => l.createdByUserId === session?.user?.id);

  const selectedLink = useMemo(
    () => viewableLinks.find((l) => l.id === selectedLinkId) ?? null,
    [viewableLinks, selectedLinkId],
  );

  if (selectedLink) {
    return (
      <LinkAnalyticsView
        link={selectedLink}
        onBack={() => setSelectedLinkId(null)}
      />
    );
  }

  return (
    <OrgDashboard
      orgSlug={org.slug}
      onViewLink={setSelectedLinkId}
      links={viewableLinks}
      scopedToMember={!canSeeAll}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Organization-wide dashboard (default view)
// ─────────────────────────────────────────────────────────────────────────────

function OrgDashboard({
  orgSlug,
  onViewLink,
  links,
  scopedToMember,
}: {
  orgSlug: string;
  onViewLink: (linkId: string) => void;
  links: LinkRow[];
  scopedToMember: boolean;
}) {
  const { data, loading, error } = useAnalytics(orgSlug);
  const analytics = data as OrgAnalytics | null;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {scopedToMember
            ? "Performance across the links you created in this workspace."
            : "Performance across every link in this workspace."}
        </p>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 py-12 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Loading analytics…
        </div>
      ) : error || !analytics ? (
        <div className="border bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {error ?? "Failed to load analytics."}
        </div>
      ) : analytics.linkCount === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center bg-muted/20">
          <p className="text-sm text-muted-foreground">
            No links created in this workspace yet.{" "}
            <Link
              href={`/orgs/${orgSlug}/links`}
              className="underline underline-offset-2 hover:text-foreground"
            >
              Create your first link
            </Link>{" "}
            to start collecting analytics.
          </p>
        </div>
      ) : (
        <>
          {/* KPI Row */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <StatCard
              label="Total Clicks"
              value={analytics.totalClicks}
              subtitle="All visits excluding bots"
            />
            <StatCard
              label="Unique Visitors"
              value={analytics.uniqueClicks}
              subtitle="Distinct IP addresses"
            />
            <StatCard
              label="Total Links"
              value={analytics.linkCount}
              subtitle={`${analytics.activeLinkCount} currently active`}
            />
            <StatCard
              label="Active Links"
              value={analytics.activeLinkCount}
              subtitle="Live and accepting clicks"
            />
            <StatCard
              label="Filtered Bots"
              value={analytics.botClicks}
              subtitle="Crawler visits excluded"
            />
          </div>

          {/* Charts */}
          <div className="grid gap-6 lg:grid-cols-2">
            <ClicksOverTimeCard
              data={analytics.daily}
              isEmpty={analytics.totalClicks === 0}
            />
            <DeviceBreakdownCard
              data={analytics.devices}
              isEmpty={analytics.totalClicks === 0}
            />
            <ReferrersCard
              data={analytics.referrers}
              isEmpty={analytics.totalClicks === 0}
            />
            <CountriesCard
              data={analytics.countries}
              isEmpty={analytics.totalClicks === 0}
            />
          </div>

          {/* Top Links */}
          <TopLinksCard links={links} onViewLink={onViewLink} />
        </>
      )}
    </div>
  );
}

function TopLinksCard({
  links,
  onViewLink,
}: {
  links: LinkRow[];
  onViewLink: (linkId: string) => void;
}) {
  const ranked = [...links].sort((a, b) => b.clickCount - a.clickCount).slice(0, 5);

  if (ranked.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Links</CardTitle>
        <CardDescription>Your 5 best performing short links</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-xs sm:text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-3 py-2.5 text-left font-medium text-muted-foreground">
                  #
                </th>
                <th className="px-3 py-2.5 text-left font-medium text-muted-foreground">
                  Short URL
                </th>
                <th className="hidden px-3 py-2.5 text-left font-medium text-muted-foreground sm:table-cell">
                  Destination
                </th>
                <th className="px-3 py-2.5 text-right font-medium text-muted-foreground">
                  Clicks
                </th>
                <th className="px-3 py-2.5 text-right font-medium text-muted-foreground">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {ranked.map((row, idx) => (
                <tr
                  key={row.id}
                  className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                >
                  <td className="px-3 py-3 font-mono tabular-nums text-muted-foreground">
                    {idx + 1}
                  </td>
                  <td className="px-3 py-3 font-mono text-xs sm:text-sm font-semibold text-foreground">
                    /{row.slug}
                  </td>
                  <td className="hidden max-w-[220px] truncate px-3 py-3 text-muted-foreground sm:table-cell sm:max-w-xs">
                    {row.originalUrl}
                  </td>
                  <td className="px-3 py-3 text-right font-mono font-medium tabular-nums">
                    {row.clickCount.toLocaleString()}
                  </td>
                  <td className="px-3 py-3 text-right">
                    <Button
                      id={`top-analytics-btn-${row.id}`}
                      variant="outline"
                      size="xs"
                      className="gap-1 h-7 text-xs font-medium"
                      onClick={() => onViewLink(row.id)}
                    >
                      <BarChart2 className="size-3" />
                      View Analytics
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Per-link detail view
// ─────────────────────────────────────────────────────────────────────────────

function LinkAnalyticsView({
  link,
  onBack,
}: {
  link: LinkRow;
  onBack: () => void;
}) {
  const org = useOrganization();
  const { data, loading, error } = useAnalytics(org.slug, link.id);
  const analytics = data as LinkAnalytics | null;
  const status = getLinkStatus(link.isActive, link.expiresAt, link.scheduledAt);

  // Click-cap usage bar (only when a cap is configured)
  const capPct =
    link.clickCap && link.clickCap > 0
      ? Math.min(100, (link.clickCount / link.clickCap) * 100)
      : null;

  return (
    <div className="space-y-6">
      {/* Navigation */}
      <div>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 pl-0 hover:bg-transparent hover:text-primary text-muted-foreground transition-colors"
          onClick={onBack}
        >
          <ArrowLeft className="size-4" />
          <span>Back to Overview</span>
        </Button>
      </div>

      {/* Link metadata header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex flex-wrap items-center gap-2 text-xl font-bold tracking-tight">
            <span className="font-mono">/{link.slug}</span>
            <StatusBadge status={status} />
          </CardTitle>
          <CardDescription className="truncate max-w-xl">
            {link.originalUrl}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-xs text-muted-foreground">
                /{link.slug}
              </span>
              <CopyButton value={`/${link.slug}`} className="h-6 w-6" />
              <a
                href={`/${link.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors p-1"
                title="Open link"
              >
                <ExternalLink className="size-3.5" />
              </a>
            </div>

            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Link2 className="size-3.5" />
                Created {new Date(link.createdAt).toLocaleDateString()}
              </span>
              {capPct !== null && (
                <span className="inline-flex items-center gap-1.5">
                  <Eye className="size-3.5" />
                  <span className="font-mono tabular-nums">
                    {link.clickCount.toLocaleString()} /{" "}
                    {link.clickCap?.toLocaleString()} cap used
                  </span>
                </span>
              )}
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="size-3.5" />
                Bots filtered automatically
              </span>
            </div>
          </div>

          {capPct !== null && (
            <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${Math.max(capPct, 1)}%` }}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Full-width live analytics */}
      {loading ? (
        <div className="flex items-center gap-2 py-12 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Loading analytics…
        </div>
      ) : error || !analytics ? (
        <div className="border bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {error ?? "Failed to load analytics."}
        </div>
      ) : (
        <AnalyticsCharts
          kpi={{
            totalClicks: analytics.totalClicks,
            uniqueClicks: analytics.uniqueClicks,
            botClicks: analytics.botClicks,
          }}
          dailyActivity={analytics.daily}
          deviceBreakdown={analytics.devices}
          hourlyActivity={analytics.hourly}
          weeklyActivity={analytics.weekly}
          topReferrers={analytics.referrers}
          topCountries={analytics.countries}
          recentClicks={analytics.recent}
        />
      )}
    </div>
  );
}
