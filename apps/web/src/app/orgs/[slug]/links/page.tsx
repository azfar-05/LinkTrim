"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  BarChart3,
  ChevronDownIcon,
  ExternalLinkIcon,
  LockIcon,
  PlusIcon,
  PowerIcon,
  SearchIcon,
  ShuffleIcon,
  UserPlusIcon,
  XIcon,
} from "lucide-react";

import { Button } from "@LinkTrim/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@LinkTrim/ui/components/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@LinkTrim/ui/components/empty";
import { Input } from "@LinkTrim/ui/components/input";
import { Label } from "@LinkTrim/ui/components/label";
import { Skeleton } from "@LinkTrim/ui/components/skeleton";
import { useOrganization } from "@/context/organization-context";
import { isReservedSlug, reservedSlugMessage } from "@LinkTrim/auth/reserved-slugs";
import { authClient } from "@/lib/auth-client";
import { isAdminRole } from "@/lib/roles";
import { CopyButton } from "@/components/copy-button";
import LinkAnalyticsModal, {
  type LinkAnalyticsLink,
} from "@/components/link-analytics-modal";
import { getLinkStatus, StatusBadge } from "@/components/status-badge";
import { useOrgLinks } from "@/hooks/use-org-links";
import { isValidLinkSlug, randomSlug } from "@/lib/slugs";
import type { LinkRow } from "@/types/links";

export default function LinksPage() {
  const org = useOrganization();
  const { data: session } = authClient.useSession();

  // Management + analytics visibility rule: owners/admins control every
  // link, regular members only links they created. Mirrors server-side
  // enforcement in PATCH /api/links and GET /api/analytics.
  const canSeeAllAnalytics = isAdminRole(
    org.members?.find((m) => m.userId === session?.user?.id)?.role ?? "",
  );
  const canManageLink = (row: LinkRow) =>
    canSeeAllAnalytics || row.createdByUserId === session?.user?.id;

  const { links, setLinks, loading, refetch: fetchLinks } = useOrgLinks(org.slug);

  const [query, setQuery] = useState("");
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

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

  // ── Enable / disable ──
  async function handleToggleActive(row: LinkRow) {
    const next = !row.isActive;
    setLinks((prev) =>
      prev.map((l) => (l.id === row.id ? { ...l, isActive: next } : l)),
    );

    try {
      const res = await fetch("/api/links", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationSlug: org.slug,
          linkId: row.id,
          isActive: next,
        }),
      });

      if (!res.ok) throw new Error();

      toast.success(
        next ? `/${row.slug} enabled` : `/${row.slug} disabled`,
      );
    } catch {
      setLinks((prev) =>
        prev.map((l) => (l.id === row.id ? { ...l, isActive: !next } : l)),
      );
      toast.error("Failed to update link");
    }
  }

  const filteredLinks = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return links;
    return links.filter(
      (l) =>
        l.slug.toLowerCase().includes(q) ||
        l.originalUrl.toLowerCase().includes(q),
    );
  }, [links, query]);

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
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Workspace
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">
          Links<span className="text-chart-3">.</span>
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Create and manage short links for your organization.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create Link</CardTitle>
          <CardDescription>
            Shorten a destination URL. Leave the slug empty for a random one.
          </CardDescription>
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
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-xs text-muted-foreground">
                    /
                  </span>
                  <Input
                    id="slug"
                    className="pl-6 font-mono"
                    placeholder="my-link"
                    value={slug}
                    onChange={(e) => handleSlugChange(e.target.value)}
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="shrink-0 gap-1.5"
                  onClick={() => {
                    const s = randomSlug();
                    setSlug(s);
                    setSlugError("");
                  }}
                >
                  <ShuffleIcon className="size-3.5" />
                  Random
                </Button>
              </div>
              {slugError && (
                <p className="text-xs text-destructive">{slugError}</p>
              )}
            </div>

            <button
              type="button"
              aria-expanded={showAdvanced}
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              Advanced options
              <ChevronDownIcon
                className={`size-3.5 transition-transform ${showAdvanced ? "rotate-180" : ""}`}
              />
            </button>

            {showAdvanced && (
              <div className="grid gap-4 rounded-lg border bg-muted/30 p-4 sm:grid-cols-3">
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

            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating…" : "Create Link"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold tracking-tight">
            All Links
            {!loading && links.length > 0 && (
              <span className="ml-1.5 text-sm font-normal text-muted-foreground">
                ({filteredLinks.length === links.length ? links.length : `${filteredLinks.length} of ${links.length}`})
              </span>
            )}
          </h2>
          {!loading && links.length > 0 && (
            <div className="relative w-full sm:w-64">
              <SearchIcon className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search slug or URL…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-8 pr-8"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground"
                >
                  <XIcon className="size-3.5" />
                </button>
              )}
            </div>
          )}
        </div>

        {loading ? (
          <Card className="gap-0 py-0">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 border-b px-4 py-3.5 last:border-0">
                <Skeleton className="h-4 w-24 rounded-md" />
                <Skeleton className="h-4 flex-1 rounded-md" />
                <Skeleton className="hidden h-4 w-16 rounded-md sm:block" />
                <Skeleton className="hidden h-4 w-20 rounded-md md:block" />
              </div>
            ))}
          </Card>
        ) : links.length === 0 ? (
          <Empty className="rounded-xl border border-dashed border-border bg-card/30 py-14">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <SearchIcon className="size-5" />
              </EmptyMedia>
              <EmptyTitle>No links yet</EmptyTitle>
              <EmptyDescription>
                Create your first short link above — it&apos;ll show up here
                with live click analytics.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : filteredLinks.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No links match “{query.trim()}”.
          </p>
        ) : (
          <Card className="overflow-x-auto py-0">
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
                    Status
                  </th>
                  <th className="hidden px-4 py-2.5 text-left font-medium text-muted-foreground lg:table-cell">
                    Created
                  </th>
                  <th className="px-4 py-2.5 text-right font-medium text-muted-foreground">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredLinks.map((row) => {
                  const status = getLinkStatus(
                    row.isActive,
                    row.expiresAt,
                    row.scheduledAt,
                  );
                  const capped = row.clickCap !== null;
                  const pct = capped
                    ? Math.min(100, (row.clickCount / (row.clickCap as number)) * 100)
                    : 0;

                  return (
                    <tr
                      key={row.id}
                      className="border-b transition-colors last:border-0 hover:bg-muted/40"
                    >
                      <td className="whitespace-nowrap px-4 py-3">
                        <span className="inline-flex items-center gap-0.5">
                          <code className="font-mono text-xs sm:text-sm">
                            /{row.slug}
                          </code>
                          <CopyButton
                            value={
                              origin
                                ? `${origin}/${row.slug}`
                                : `/${row.slug}`
                            }
                          />
                        </span>
                      </td>
                      <td className="max-w-[180px] px-4 py-3 sm:max-w-xs">
                        <a
                          href={row.originalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group/dest inline-flex max-w-full items-center gap-1 text-muted-foreground hover:text-foreground hover:underline"
                          title={row.originalUrl}
                        >
                          <span className="truncate">{row.originalUrl}</span>
                          <ExternalLinkIcon className="size-3 shrink-0 opacity-0 transition-opacity group-hover/dest:opacity-100" />
                        </a>
                      </td>
                      <td className="px-4 py-3 text-right align-top">
                        <span className="font-mono">
                          {row.clickCount.toLocaleString()}
                          {capped && (
                            <span className="text-muted-foreground">
                              {" "}
                              / {row.clickCap}
                            </span>
                          )}
                        </span>
                        {capped && (
                          <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full rounded-full bg-chart-3 transition-all"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        )}
                      </td>
                      <td className="hidden px-4 py-3 sm:table-cell">
                        <StatusBadge status={status} />
                      </td>
                      <td className="hidden px-4 py-3 lg:table-cell">
                        <div className="text-muted-foreground">
                          {new Date(row.createdAt).toLocaleDateString()}
                          {row.createdByName && (
                            <div className="text-[11px]">
                              by {row.createdByName}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {canManageLink(row) ? (
                            <>
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => handleToggleActive(row)}
                                aria-label={
                                  row.isActive
                                    ? `Disable /${row.slug}`
                                    : `Enable /${row.slug}`
                                }
                                title={
                                  row.isActive
                                    ? "Disable link"
                                    : "Enable link"
                                }
                                className={
                                  row.isActive
                                    ? "text-chart-3 hover:text-chart-3"
                                    : "text-muted-foreground"
                                }
                              >
                                <PowerIcon className="size-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => openLinkAnalytics(row)}
                                aria-label={`View analytics for /${row.slug}`}
                                title="View analytics"
                              >
                                <BarChart3 className="size-3.5" />
                              </Button>
                            </>
                          ) : (
                            <span
                              className="inline-flex size-7 items-center justify-center text-muted-foreground/40"
                              title="Only the link creator or org admins can manage this link"
                            >
                              <LockIcon className="size-3.5" />
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
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
