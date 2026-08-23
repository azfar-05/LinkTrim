"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BarChart3, Loader2Icon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@LinkTrim/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@LinkTrim/ui/components/card";
import { Input } from "@LinkTrim/ui/components/input";
import { Label } from "@LinkTrim/ui/components/label";
import { useOrganization } from "@/context/organization-context";
import { isReservedSlug, reservedSlugMessage } from "@LinkTrim/auth/reserved-slugs";
import LinkAnalyticsModal, {
  type LinkAnalyticsLink,
} from "@/components/link-analytics-modal";
import { getLinkStatus, StatusBadge } from "@/components/status-badge";
import { useOrgLinks } from "@/hooks/use-org-links";
import { isValidLinkSlug, randomSlug } from "@/lib/slugs";
import type { LinkRow } from "@/types/links";

export default function LinksPage() {
  const org = useOrganization();
  const router = useRouter();

  const { links, loading, refetch: fetchLinks } = useOrgLinks(org.slug);

  // ── Per-link analytics drawer ──
  const [analyticsLink, setAnalyticsLink] = useState<LinkAnalyticsLink | null>(null);
  const [analyticsOpen, setAnalyticsOpen] = useState(false);

  function openLinkAnalytics(row: LinkRow) {
    setAnalyticsLink({
      id: row.id,
      title: `/${row.slug}`,
      shortUrl: `/${row.slug}`,
      originalUrl: row.originalUrl,
    });
    setAnalyticsOpen(true);
  }

  const [originalUrl, setOriginalUrl] = useState("");
  const [slug, setSlug] = useState("");
  const [slugError, setSlugError] = useState("");
  const [clickCap, setClickCap] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const handleSlugChange = (value: string) => {
    setSlug(value);
    if (value && !isValidLinkSlug(value)) {
      setSlugError(
        "Letters, numbers and hyphens only. Must start and end with a letter or number.",
      );
    } else if (value && isReservedSlug(value)) {
      setSlugError(reservedSlugMessage(value));
    } else {
      setSlugError("");
    }
  };

  const resetForm = () => {
    setOriginalUrl("");
    setSlug("");
    setSlugError("");
    setClickCap("");
    setExpiresAt("");
    setScheduledAt("");
    setShowAdvanced(false);
    setSubmitError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationSlug: org.slug,
          originalUrl,
          slug: slug || undefined,
          clickCap: clickCap ? Number(clickCap) : undefined,
          expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined,
          scheduledAt: scheduledAt
            ? new Date(scheduledAt).toISOString()
            : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 409) {
          setSubmitError(`Slug "${data.slug}" is already taken.`);
        } else {
          setSubmitError(data.error || "Failed to create link");
        }
        return;
      }

      toast.success("Link created", { description: `/${data.slug}` });
      resetForm();
      await fetchLinks();
    } catch {
      setSubmitError("Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Links</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Create and manage short links for your organization.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create Link</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {submitError && (
              <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                {submitError}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="url">Destination URL</Label>
              <Input
                id="url"
                type="url"
                placeholder="https://example.com/my-long-url"
                value={originalUrl}
                onChange={(e) => setOriginalUrl(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Custom slug (optional)</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 font-mono text-xs text-muted-foreground">
                    /
                  </span>
                  <Input
                    id="slug"
                    className="pl-4"
                    placeholder="my-link"
                    value={slug}
                    onChange={(e) => handleSlugChange(e.target.value)}
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="shrink-0"
                  onClick={() => {
                    const s = randomSlug();
                    setSlug(s);
                    setSlugError("");
                  }}
                >
                  Random
                </Button>
              </div>
              {slugError && (
                <p className="text-xs text-destructive">{slugError}</p>
              )}
            </div>

            <button
              type="button"
              className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              {showAdvanced ? "Hide" : "Show"} advanced options
            </button>

            {showAdvanced && (
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="clickCap">Click cap</Label>
                  <Input
                    id="clickCap"
                    type="number"
                    min="1"
                    placeholder="Unlimited"
                    value={clickCap}
                    onChange={(e) => setClickCap(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expiresAt">Expires at</Label>
                  <Input
                    id="expiresAt"
                    type="datetime-local"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="scheduledAt">Schedule for</Label>
                  <Input
                    id="scheduledAt"
                    type="datetime-local"
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                  />
                </div>
              </div>
            )}

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating…" : "Create Link"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-lg font-semibold tracking-tight">
          All Links
          {!loading && links.length > 0 && (
            <span className="ml-1.5 text-sm font-normal text-muted-foreground">
              ({links.length})
            </span>
          )}
        </h2>
        {loading ? (
          <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2Icon className="size-4 animate-spin" />
            Loading links…
          </div>
        ) : links.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">
            No links yet. Create one above.
          </p>
        ) : (
          <Card className="mt-3 overflow-x-auto py-0">
            <table className="w-full text-xs sm:text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">
                    Slug
                  </th>
                  <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">
                    Destination
                  </th>
                  <th className="px-4 py-2.5 text-right font-medium text-muted-foreground">
                    Clicks
                  </th>
                  <th className="hidden px-4 py-2.5 text-left font-medium text-muted-foreground sm:table-cell">
                    Status
                  </th>
                  <th className="hidden px-4 py-2.5 text-left font-medium text-muted-foreground md:table-cell">
                    Created
                  </th>
                  <th className="px-4 py-2.5 text-right font-medium text-muted-foreground">
                    <span className="sr-only">Analytics</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {links.map((row) => (
                  <tr key={row.id} className="border-b last:border-0">
                    <td className="px-4 py-3 font-mono text-xs sm:text-sm">
                      {row.slug}
                    </td>
                    <td className="max-w-[200px] truncate px-4 py-3 text-muted-foreground sm:max-w-xs">
                      {row.originalUrl}
                    </td>
                    <td className="px-4 py-3 text-right font-mono">
                      {row.clickCount.toLocaleString()}
                      {row.clickCap !== null && (
                        <span className="text-muted-foreground">
                          {" "}
                          / {row.clickCap}
                        </span>
                      )}
                    </td>
                    <td className="hidden px-4 py-3 sm:table-cell">
                      <StatusBadge
                        status={getLinkStatus(
                          row.isActive,
                          row.expiresAt,
                          row.scheduledAt,
                        )}
                      />
                    </td>
                    <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                      {new Date(row.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        id={`analytics-btn-${row.id}`}
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => openLinkAnalytics(row)}
                        aria-label={`View analytics for /${row.slug}`}
                        title="View analytics"
                      >
                        <BarChart3 className="size-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
                </tbody>
            </table>
          </Card>
        )}
      </div>

      {/* ── Per-link analytics drawer ── */}
      <LinkAnalyticsModal
        isOpen={analyticsOpen}
        onClose={() => setAnalyticsOpen(false)}
        organizationSlug={org.slug}
        link={analyticsLink}
      />
    </div>
  );
}
