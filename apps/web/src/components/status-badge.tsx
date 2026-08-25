export type LinkStatus = "active" | "expired" | "disabled" | "scheduled";

export function getLinkStatus(
  isActive: boolean,
  expiresAt: string | Date | null,
  scheduledAt: string | Date | null,
): LinkStatus {
  if (!isActive) return "disabled";
  if (scheduledAt && new Date(scheduledAt) > new Date()) return "scheduled";
  if (expiresAt && new Date(expiresAt) < new Date()) return "expired";
  return "active";
}

const STYLES: Record<LinkStatus, string> = {
  active: "text-chart-3",
  expired: "text-muted-foreground",
  disabled: "text-destructive",
  scheduled: "text-muted-foreground",
};

export function StatusBadge({
  status,
}: {
  status: LinkStatus;
}) {
  return (
    <span className={`font-mono text-xs ${STYLES[status]}`}>{status}</span>
  );
}
