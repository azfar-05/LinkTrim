import { useCallback, useEffect, useState } from "react";

import type { LinkRow } from "@/types/links";

export function useOrgLinks(orgSlug: string) {
  const [links, setLinks] = useState<LinkRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLinks = useCallback(async () => {
    try {
      const res = await fetch(`/api/links?organizationSlug=${orgSlug}`);
      if (res.ok) {
        setLinks(await res.json());
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [orgSlug]);

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  return { links, setLinks, loading, refetch: fetchLinks };
}
