"use client";

import React, { useState } from "react";
import { authClient } from "@/lib/auth-client";
import type { Organization } from "@/types/dashboard";
import OrgCard from "@/components/org-card";
import CreateOrgDialog from "@/components/create-org-dialog";
import { Button } from "@LinkTrim/ui/components/button";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
  EmptyMedia,
} from "@LinkTrim/ui/components/empty";
import { Building2Icon, PlusIcon } from "lucide-react";
import { toast } from "sonner";

export default function Organization({
  session,
}: {
  session: typeof authClient.$Infer.Session;
}) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const {
    data: organizations,
    error,
    isPending,
    refetch,
  } = authClient.useListOrganizations();

  const mappedOrganizations: Organization[] =
    organizations?.map((org) => ({
      id: org.id,
      name: org.name,
      slug: org.slug,
      logoUrl: org.logo ?? undefined,
      createdAt: org.createdAt,

      // Placeholder values until we implement members/roles
      memberCount: 1,
      currentUserRole: "ADMIN",
    })) ?? [];

  const handleCreateOrg = async ({
    name,
    slug,
  }: {
    name: string;
    slug: string;
  }) => {
    const { error } = await authClient.organization.create({
      name,
      slug,
    });

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success(`Organization "${name}" created successfully!`);

    setIsCreateOpen(false);

    await refetch();
  };

  if (error) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <p className="text-sm text-destructive">
          Failed to load organizations.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 md:py-12">
      <div className="flex flex-col gap-4 border-b border-border/50 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Your Organizations
          </h1>

          <p className="mt-1 text-xs text-muted-foreground">
            Welcome back, {session.user.name}. Manage and route your brand
            assets.
          </p>
        </div>

        <Button
          onClick={() => setIsCreateOpen(true)}
          className="gap-1.5 self-start sm:self-auto"
        >
          <PlusIcon className="size-4" />
          Create Organization
        </Button>
      </div>

      {isPending ? (
        <p className="text-sm text-muted-foreground">
          Loading organizations...
        </p>
      ) : mappedOrganizations.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {mappedOrganizations.map((org) => (
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
              Organizations allow you to organize links, collaborate with
              teammates, and access unified analytics.
            </EmptyDescription>
          </EmptyHeader>

          <EmptyContent>
            <Button
              onClick={() => setIsCreateOpen(true)}
              className="gap-1.5"
            >
              <PlusIcon className="size-4" />
              Create your first organization
            </Button>
          </EmptyContent>
        </Empty>
      )}

      <CreateOrgDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onCreate={handleCreateOrg}
      />
    </div>
  );
}