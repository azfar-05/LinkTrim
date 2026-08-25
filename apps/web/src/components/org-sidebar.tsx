"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Home,
  Key,
  Link2,
  Settings,
  Users,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
} from "@LinkTrim/ui/components/sidebar";

import { useOrganization } from "@/context/organization-context";
import { authClient } from "@/lib/auth-client";
import { isAdminRole } from "@/lib/roles";

const items = [
  {
    title: "Overview",
    href: "",
    icon: Home,
  },
  {
    title: "Links",
    href: "/links",
    icon: Link2,
  },
  {
    title: "Analytics",
    href: "/analytics",
    icon: BarChart3,
  },
  {
    title: "Members",
    href: "/members",
    icon: Users,
  },
  {
    title: "API Keys",
    href: "/api-keys",
    icon: Key,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export default function OrgSidebar() {
  const pathname = usePathname();
  const org = useOrganization();
  const { data: session } = authClient.useSession();

  const memberCount = Array.isArray(org?.members)
    ? (org.members.length as number)
    : null;
  const isAdmin = isAdminRole(
    org.members?.find(
      (m: { userId: string; role: string }) =>
        m.userId === session?.user?.id,
    )?.role ?? "",
  );
  const role = org.members?.find(
    (m: { userId: string; role: string }) => m.userId === session?.user?.id,
  )?.role as string | undefined;

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="relative z-10">
        <SidebarMenu>
          {/* Workspace switcher — back to all organizations */}
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              render={<Link href="/orgs" />}
              tooltip="All workspaces"
              className="h-auto py-2"
            >
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground shadow-sm">
                {org.name.charAt(0).toUpperCase()}
              </div>
              <div className="grid flex-1 text-left leading-tight">
                <span className="truncate text-sm font-semibold tracking-tight">
                  {org.name}
                </span>
                <span className="truncate font-mono text-[10px] text-muted-foreground">
                  /{org.slug}
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="relative z-10 gap-0 px-1">
        <SidebarGroup className="px-1">
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              {items.map((item) => {
                const href = `/orgs/${org.slug}${item.href}`;
                const active = pathname === href;

                return (
                  <SidebarMenuItem key={item.title}>
                    {/* Active indicator bar */}
                    {active && (
                      <span
                        aria-hidden
                        className="absolute -left-1 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-chart-3"
                      />
                    )}
                    <SidebarMenuButton
                      render={<Link href={{ pathname: href }} />}
                      isActive={active}
                      tooltip={item.title}
                      className={`relative h-9 gap-2.5 rounded-md px-2 text-sm ${
                        active
                          ? "bg-primary/10 font-medium text-primary hover:bg-primary/15 hover:text-primary"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <item.icon className="size-4" />
                      <span>{item.title}</span>
                      {item.title === "Members" && memberCount !== null && (
                        <span className="ml-auto rounded-md bg-muted/60 px-1.5 font-mono text-[10px] tabular-nums text-muted-foreground group-data-[collapsible=icon]:hidden">
                          {memberCount}
                        </span>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Role chip pinned under navigation */}
        {role && (
          <div className="mt-4 px-4 group-data-[collapsible=icon]:hidden">
            <span
              className={`inline-flex select-none items-center gap-1.5 rounded-md border px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${
                isAdmin
                  ? "border-primary/20 bg-primary/5 text-primary"
                  : "border-border bg-muted/50 text-muted-foreground"
              }`}
            >
              {isAdmin ? "★" : "•"}
              {role}
            </span>
          </div>
        )}
      </SidebarContent>

      <SidebarFooter className="relative z-10">
        <SidebarMenu>
          {/* Signed-in user card */}
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              tooltip={session?.user.name ?? "Account"}
              className="h-auto cursor-default items-center gap-2.5 py-2"
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-border/60 bg-muted/60 text-xs font-semibold text-foreground">
                {session?.user.name?.charAt(0).toUpperCase() ?? "?"}
              </span>
              <span className="grid flex-1 text-left leading-tight">
                <span className="truncate text-xs font-medium">
                  {session?.user.name ?? "…"}
                </span>
                <span className="truncate text-[10px] text-muted-foreground">
                  {session?.user.email ?? ""}
                </span>
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem className="flex items-center justify-between gap-2 px-2 pt-1 group-data-[collapsible=icon]:hidden">
            <span className="font-mono text-[10px] text-muted-foreground/60">
              LinkTrim
            </span>
            <SidebarTrigger className="size-6 text-muted-foreground" />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
