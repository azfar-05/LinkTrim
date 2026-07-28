"use client";

import Link from "next/link";
import { BarChart2, Link2, Users } from "lucide-react";
import { useOrganization } from "@/context/organization-context";

export default function Page() {
  const org = useOrganization();

  const cards = [
    {
      title: "Links",
      description: "Create, view, and manage all shortened links for this organization.",
      icon: Link2,
      href: `/orgs/${org.slug}/links`,
    },
    {
      title: "Analytics",
      description: "Inspect click metrics, device breakdowns, and peak activity timing.",
      icon: BarChart2,
      href: `/orgs/${org.slug}/analytics`,
    },
    {
      title: "Members",
      description: "Manage team workspace members, invites, and access permissions.",
      icon: Users,
      href: `/orgs/${org.slug}/members`,
    },
  ];

  return (
    <main className="mx-auto w-full max-w-7xl px-6 py-10 space-y-8">
      {/* Welcome Header */}
      <div className="rounded-lg border bg-card p-8 shadow-sm">
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome to {org.name}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This is your workspace overview. Select a section below to get started or view details.
        </p>
      </div>

      {/* Grid of Navigation Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.title}
              href={{ pathname: card.href }}
              className="group relative flex flex-col justify-between rounded-lg border bg-card p-6 shadow-sm hover:shadow-md hover:border-ring transition-all duration-200 outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <div className="space-y-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-none border bg-muted/50 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-lg font-semibold tracking-tight group-hover:text-primary transition-colors flex items-center gap-1.5">
                    {card.title}
                    <span className="inline-block transform group-hover:translate-x-1 transition-transform">
                      &rarr;
                    </span>
                  </h2>
                  <p className="text-xs text-muted-foreground leading-normal">
                    {card.description}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
