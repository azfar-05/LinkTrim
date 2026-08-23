"use client";

import Link from "next/link";
import { ArrowRightIcon, BarChart3, Link2, Users } from "lucide-react";
import { useOrganization } from "@/context/organization-context";

export default function Page() {
  const org = useOrganization();

  const cards = [
    {
      title: "Links",
      description:
        "Create, view, and manage all shortened links for this organization.",
      icon: Link2,
      href: `/orgs/${org.slug}/links`,
    },
    {
      title: "Analytics",
      description:
        "Inspect click metrics, device breakdowns, and peak activity timing.",
      icon: BarChart3,
      href: `/orgs/${org.slug}/analytics`,
    },
    {
      title: "Members",
      description:
        "Manage team workspace members, invites, and access permissions.",
      icon: Users,
      href: `/orgs/${org.slug}/members`,
    },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 px-6 py-10">
      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Workspace
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight md:text-3xl">
          Welcome to {org.name}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Select a section below to get started.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.title}
              href={{ pathname: card.href }}
              className="group flex flex-col rounded-xl border border-border bg-card p-6 shadow-sm outline-none transition-all duration-200 hover:border-ring hover:bg-accent/5 hover:shadow-md focus-visible:ring-1 focus-visible:ring-ring"
            >
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
                <Icon className="size-5" />
              </div>
              <h2 className="mt-4 text-base font-semibold tracking-tight transition-colors group-hover:text-primary">
                {card.title}
              </h2>
              <p className="mt-1.5 text-xs leading-normal text-muted-foreground">
                {card.description}
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors group-hover:text-primary">
                Open
                <ArrowRightIcon className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
