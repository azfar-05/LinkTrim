"use client";

import { useState } from "react";
import { ArrowLeft, BarChart2, ExternalLink } from "lucide-react";

import { Button } from "@LinkTrim/ui/components/button";
import { useOrganization } from "@/context/organization-context";
import AnalyticsCharts from "@/components/analytics-charts";
import { CopyButton } from "@/components/copy-button";
import { getLinkAnalytics } from "@/components/link-analytics-modal";
import { useOrgLinks } from "@/hooks/use-org-links";
import type { LinkRow } from "@/types/links";

export default function AnalyticsPage() {
  const org = useOrganization();
  const { links, loading } = useOrgLinks(org.slug);

  // ── Selected Link State (for Full Page Analytics View) ──
  const [selectedLink, setSelectedLink] = useState<LinkRow | null>(null);

  // If a link is selected, render the Full-Page Analytics View
  if (selectedLink) {
    const shortUrl = `${window.location.origin}/${selectedLink.slug}`;
    const analyticsData = getLinkAnalytics(selectedLink.clickCount);

    return (
      <div className="space-y-6">
        {/* Navigation & Header bar */}
        <div>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 pl-0 hover:bg-transparent hover:text-primary text-muted-foreground transition-colors"
            onClick={() => setSelectedLink(null)}
          >
            <ArrowLeft className="size-4" />
            <span>Back to Links List</span>
          </Button>
        </div>

        {/* Selected Link Metadata Header */}
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight">
                  /{selectedLink.slug}
                </h1>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-muted text-muted-foreground">
                  Active
                </span>
              </div>
              <p className="text-sm text-muted-foreground truncate">
                {selectedLink.originalUrl}
              </p>
            </div>

            <div className="flex flex-col gap-1.5 md:items-end text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <span className="font-mono">{shortUrl}</span>
                <CopyButton value={shortUrl} className="h-6 w-6" />
                <a
                  href={shortUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground transition-colors p-1"
                  title="Open link"
                >
                  <ExternalLink className="size-3.5" />
                </a>
              </div>
              <div>
                Created on {new Date(selectedLink.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>

        {/* Full-width Analytics Charts */}
        <AnalyticsCharts {...analyticsData} />
      </div>
    );
  }

  // Links List View (default)
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Select a link below to view its detailed performance analytics.
        </p>
      </div>

      {/* Links List Table */}
      <div className="pt-2">
        {loading ? (
          <p className="text-sm text-muted-foreground py-4">Loading links list…</p>
        ) : links.length === 0 ? (
          <div className="rounded-lg border border-dashed p-8 text-center bg-muted/20">
            <p className="text-sm text-muted-foreground">
              No links created in this workspace yet. Create links to view performance.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto border bg-card/50">
            <table className="w-full text-xs sm:text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">
                    Short URL
                  </th>
                  <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">
                    Destination
                  </th>
                  <th className="px-4 py-2.5 text-right font-medium text-muted-foreground">
                    Clicks
                  </th>
                  <th className="hidden px-4 py-2.5 text-left font-medium text-muted-foreground sm:table-cell">
                    Created
                  </th>
                  <th className="px-4 py-2.5 text-right font-medium text-muted-foreground">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {links.map((row) => {
                  const shortUrl = `${window.location.origin}/${row.slug}`;
                  return (
                    <tr key={row.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs sm:text-sm">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-foreground">/{row.slug}</span>
                          <a
                            href={shortUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-foreground transition-colors"
                            title="Open short link"
                          >
                            <ExternalLink className="size-3" />
                          </a>
                        </div>
                      </td>
                      <td className="max-w-[220px] truncate px-4 py-3 text-muted-foreground sm:max-w-sm">
                        {row.originalUrl}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-medium">
                        {row.clickCount.toLocaleString()}
                      </td>
                      <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">
                        {new Date(row.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          id={`analytics-detail-btn-${row.id}`}
                          variant="outline"
                          size="xs"
                          className="gap-1 h-7 text-xs font-medium"
                          onClick={() => setSelectedLink(row)}
                        >
                          <BarChart2 className="size-3" />
                          View Analytics
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
