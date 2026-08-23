import Link from "next/link";
import type { Organization } from "@/types/dashboard";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@LinkTrim/ui/components/card";
import { ArrowRightIcon, UsersIcon } from "lucide-react";

interface OrgCardProps {
  org: Organization;
}

export default function OrgCard({ org }: OrgCardProps) {
  const isAdmin = org.currentUserRole === "ADMIN";

  return (
    <Link href={`/orgs/${org.slug}`} className="group block h-full focus:outline-none">
      <Card className="h-full gap-4 transition-all duration-200 hover:border-ring hover:shadow-md">
        <CardHeader>
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 font-semibold text-primary">
            {org.name.charAt(0).toUpperCase()}
          </div>
          <CardTitle className="truncate text-base font-semibold tracking-tight group-hover:text-primary transition-colors">
            {org.name}
          </CardTitle>
          <CardDescription className="truncate font-mono text-xs">
            /{org.slug}
          </CardDescription>
          <CardAction>
            <span
              className={`inline-flex shrink-0 select-none items-center rounded-md border px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                isAdmin
                  ? "border-primary/20 bg-primary/5 text-primary"
                  : "border-border bg-muted/50 text-muted-foreground"
              }`}
            >
              {org.currentUserRole}
            </span>
          </CardAction>
        </CardHeader>

        <CardContent className="mt-auto flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <UsersIcon className="size-3.5" />
            {org.memberCount} {org.memberCount === 1 ? "member" : "members"}
          </span>

          <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors group-hover:text-primary">
            Manage
            <ArrowRightIcon className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
          </span>
        </CardContent>
      </Card>
    </Link>
  );
}
