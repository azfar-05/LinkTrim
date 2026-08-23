"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Home,
  Link2,
  Settings,
  Users,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@LinkTrim/ui/components/sidebar";

import { useOrganization } from "@/context/organization-context";

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
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export default function OrgSidebar() {
  const pathname = usePathname();
  const org = useOrganization();

  return (
    <Sidebar>
      <SidebarHeader className="border-b">
        <div className="flex items-center gap-2.5 px-2 py-2">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 font-semibold text-primary">
            {org.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-sm font-semibold leading-tight">
              {org.name}
            </h2>
            <p className="truncate font-mono text-[10px] text-muted-foreground">
              /{org.slug}
            </p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu>
          {items.map((item) => {
            const href = `/orgs/${org.slug}${item.href}`;

            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  render={
                    <Link href={{ pathname: href }}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  }
                  isActive={pathname === href}
                />
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="border-t">
        <div className="px-2 py-2 text-xs text-muted-foreground">
          LinkTrim
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}