"use client";

import React, { useState } from "react";
import { authClient } from "@/lib/auth-client";
import type { Organization } from "@/types/dashboard";
import OrgCard from "@/components/org-card";
import CreateOrgDialog from "@/components/create-org-dialog";
import { Button } from "@LinkTrim/ui/components/button";
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyContent, EmptyMedia } from "@LinkTrim/ui/components/empty";
import { PlusIcon, Building2Icon } from "lucide-react";
import { toast } from "sonner";

export default function Dashboard({ session }: { session: typeof authClient.$Infer.Session }) {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const handleCreateOrg = (data: { name: string; slug: string }) => {
    const newOrg: Organization = {
      id: `org_${Math.random().toString(36).substring(2, 9)}`,
      name: data.name,
      slug: data.slug,
      memberCount: 1,
      currentUserRole: "ADMIN",
      createdAt: new Date().toISOString(),
    };

    setOrganizations((prev) => [...prev, newOrg]);
    toast.success(`Organization "${data.name}" created successfully!`);
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 md:py-12 flex flex-col gap-8">
      {/* Header section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/50 pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Your Organizations
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Welcome back, {session.user.name}. Manage and route your brand assets.
          </p>
        </div>

        <Button onClick={() => setIsCreateOpen(true)} className="gap-1.5 self-start sm:self-auto">
          <PlusIcon className="size-4" />
          Create Organization
        </Button>
      </div>

      {/* Grid or Empty State */}
      {organizations.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {organizations.map((org) => (
            <OrgCard key={org.id} org={org} />
          ))}
        </div>
      ) : (
        <Empty className="border border-dashed border-border bg-card/30 p-12">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Building2Icon className="size-5" />
            </EmptyMedia>
            <EmptyTitle>No Organizations Found</EmptyTitle>
            <EmptyDescription>
              Organizations allow you to organize links, collaborate with teammates, and access unified analytics.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button onClick={() => setIsCreateOpen(true)} className="gap-1.5">
              <PlusIcon className="size-4" />
              Create your first organization
            </Button>
          </EmptyContent>
        </Empty>
      )}

      {/* Dialog for creating organizations */}
      <CreateOrgDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onCreate={handleCreateOrg}
      />
    </div>
  );
}
