"use client";

import { ExternalLink, Loader2 } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@LinkTrim/ui/components/sheet";

import AnalyticsCharts from "@/components/analytics-charts";
import { CopyButton } from "@/components/copy-button";
import { useAnalytics } from "@/hooks/use-analytics";
import type { LinkAnalytics } from "@/types/analytics";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface LinkAnalyticsLink {
  id: string;
  /** human-readable label shown in the drawer header (slug used as fallback) */
  title: string;
  shortUrl: string;
  originalUrl: string;
}

export interface LinkAnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  organizationSlug: string;
  link: LinkAnalyticsLink | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Main export
// ─────────────────────────────────────────────────────────────────────────────

export default function LinkAnalyticsModal({
  isOpen,
  onClose,
  organizationSlug,
  link,
}: LinkAnalyticsModalProps) {
  // Fetch live aggregates from the click table whenever the drawer opens;
  // no request is made while it is closed.
  const { data, loading, error } = useAnalytics(
    organizationSlug,
    link?.id ?? null,
    { enabled: isOpen && !!link },
  );
  const analytics = link ? (data as LinkAnalytics | null) : null;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        showCloseButton
        // Override the default sm:max-w-sm to give charts room to breathe
        className="sm:max-w-2xl w-full flex flex-col overflow-y-auto"
      >
        {link && (
          <>
            {/* ── Header ── */}
            <SheetHeader className="border-b pb-4">
              <SheetTitle className="text-base font-semibold leading-tight">
                {link.title}
              </SheetTitle>

              {/* Short URL row */}
              <div className="flex items-center gap-1.5 pt-0.5">
                <span className="font-mono text-xs text-muted-foreground truncate max-w-[240px]">
                  {link.shortUrl}
                </span>
                <CopyButton value={link.shortUrl} />
                <a
                  href={link.shortUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Open short URL"
                  title="Open in new tab"
                >
                  <ExternalLink className="size-3" />
                </a>
              </div>

              {/* Original URL */}
              <SheetDescription className="truncate pt-0.5">
                → {link.originalUrl}
              </SheetDescription>
            </SheetHeader>

            {/* ── Body: live analytics ── */}
            <div className="flex-1 overflow-y-auto p-4">
              {loading ? (
                <div className="flex flex-col items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
                  <Loader2 className="size-5 animate-spin" />
                  Loading analytics…
                </div>
              ) : error || !analytics ? (
                <p className="py-8 text-center text-sm text-destructive">
                  {error ?? "No analytics available."}
                </p>
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
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
