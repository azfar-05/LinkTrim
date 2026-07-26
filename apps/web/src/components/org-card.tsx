import Link from "next/link";
import type { Organization } from "@/types/dashboard";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@LinkTrim/ui/components/card";
import { UsersIcon, ArrowRightIcon } from "lucide-react";

interface OrgCardProps {
  org: Organization;
}

export default function OrgCard({ org }: OrgCardProps) {
  const isAdmin = org.currentUserRole === "ADMIN";

  return (
    <Link href={`/orgs/${org.slug}` as any} className="group block focus:outline-none h-full">
      <Card className="h-full border border-border bg-card transition-all duration-200 hover:border-primary hover:bg-accent/5 hover:shadow-md relative overflow-hidden flex flex-col justify-between">
        {/* Subtle hover glow bar at the top */}
        <div className="absolute top-0 left-0 w-full h-[2px] bg-primary scale-x-0 transition-transform duration-200 origin-left group-hover:scale-x-100" />
        
        <CardHeader className="flex flex-row items-start justify-between gap-4 pb-2 border-b border-border/50">
          <div className="min-w-0">
            <CardTitle className="truncate text-base font-semibold tracking-tight group-hover:text-primary transition-colors">
              {org.name}
            </CardTitle>
            <CardDescription className="truncate font-mono text-[10px] text-muted-foreground mt-0.5">
              /{org.slug}
            </CardDescription>
          </div>
          
          <span
            className={`inline-flex shrink-0 items-center px-1.5 py-0.5 text-[9px] font-bold tracking-wider uppercase border rounded-none select-none ${
              isAdmin
                ? "bg-primary/5 text-primary border-primary/20"
                : "bg-secondary text-secondary-foreground border-secondary-foreground/10"
            }`}
          >
            {org.currentUserRole}
          </span>
        </CardHeader>
        
        <CardContent className="pt-4 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <UsersIcon className="size-3.5" />
            <span>
              {org.memberCount} {org.memberCount === 1 ? "member" : "members"}
            </span>
          </div>
          
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground group-hover:text-primary transition-colors">
            Manage
            <ArrowRightIcon className="size-3 transition-transform duration-200 group-hover:translate-x-0.5" />
          </span>
        </CardContent>
      </Card>
    </Link>
  );
}
