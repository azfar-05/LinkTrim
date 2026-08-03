import { isAdminRole } from "@/lib/roles";

export function RoleBadge({ role }: { role: string }) {
  const elevated = isAdminRole(role);
  return (
    <span
      className={`inline border px-2 py-0.5 font-mono text-xs ${
        elevated
          ? "border-chart-3/20 bg-chart-3/10 text-chart-3"
          : "border-muted-foreground/20 bg-muted/50 text-muted-foreground"
      }`}
    >
      {role}
    </span>
  );
}
