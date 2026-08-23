import { useCallback, useEffect, useState } from "react";

import type { LinkAnalytics, OrgAnalytics } from "@/types/analytics";

type AnalyticsData = LinkAnalytics | OrgAnalytics;

export function useAnalytics(
  organizationSlug: string | null,
  linkId: string | null = null,
  options?: { enabled?: boolean },
) {
  const enabled = options?.enabled ?? true;
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    // Skip entirely when disabled (e.g. drawer closed) or unscoped
    if (!enabled || !organizationSlug) {
      setData(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ organizationSlug });
      if (linkId) params.set("linkId", linkId);

      const res = await fetch(`/api/analytics?${params.toString()}`);
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(body?.error ?? "Failed to load analytics");
      }
      setData((await res.json()) as AnalyticsData);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  }, [organizationSlug, linkId, enabled]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return {
    data,
    loading,
    error,
    refetch,
  };
}
