"use client";

import React, { useState, useEffect, useCallback } from "react";
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
import { Building2Icon, PlusIcon, LogInIcon, RefreshCwIcon } from "lucide-react";
import { toast } from "sonner";

function roleToUserRole(role: string): "ADMIN" | "MEMBER" {
  return role === "owner" || role === "admin" ? "ADMIN" : "MEMBER";
}

export default function Organization({
  session,
}: {
  session: typeof authClient.$Infer.Session;
}) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [invitations, setInvitations] = useState<any[]>([]);
  const [invitationsLoading, setInvitationsLoading] = useState(true);
  const [invitationsError, setInvitationsError] = useState<string | null>(null);

  const {
    data: organizations,
    error,
    isPending,
    refetch,
  } = authClient.useListOrganizations();

  const fetchInvitations = useCallback(async () => {
    setInvitationsLoading(true);
    setInvitationsError(null);
    try {
      const res = await fetch("/api/invitations", {
        credentials: "include",
      });
      if (!res.ok) {
        setInvitationsError(`Failed to load invitations (${res.status})`);
        return;
      }
      const data = await res.json();
      if (Array.isArray(data)) setInvitations(data);
    } catch (err) {
      setInvitationsError(
        err instanceof Error ? err.message : "Failed to load invitations"
      );
    } finally {
      setInvitationsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInvitations();
  }, [fetchInvitations]);

  const mappedOrganizations: Organization[] =
    organizations?.map((org) => {
      const membership = (org as any).membership;
      const role = membership?.role ?? "member";
      return {
        id: org.id,
        name: org.name,
        slug: org.slug,
        logoUrl: org.logo ?? undefined,
        createdAt: org.createdAt,
        memberCount: (org as any).membersCount ?? 1,
        currentUserRole: roleToUserRole(role),
      };
    }) ?? [];

  const pendingInvitations = invitations.filter(
    (inv) => inv.status === "pending"
  );

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

  const handleAcceptInvitation = async (invitationId: string) => {
    const { error } = await authClient.organization.acceptInvitation({
      invitationId,
    });
    if (error) {
      toast.error(error.message || "Failed to accept invitation");
      return;
    }
    toast.success("Invitation accepted!");
    await refetch();
    await fetchInvitations();
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

      {invitationsError && (
        <div className="border border-destructive/20 bg-destructive/5 p-4">
          <p className="text-xs text-destructive">
            Failed to load invitations: {invitationsError}
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-2 gap-1.5"
            onClick={fetchInvitations}
          >
            <RefreshCwIcon className="size-3" />
            Retry
          </Button>
        </div>
      )}

      {!invitationsLoading && !invitationsError && pendingInvitations.length > 0 && (
        <div className="border p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold tracking-tight">
                Pending Invitations
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                You&apos;ve been invited to join these organizations.
              </p>
            </div>
            <Button variant="ghost" size="icon-sm" onClick={fetchInvitations} title="Refresh">
              <RefreshCwIcon className="size-3.5" />
            </Button>
          </div>
          <div className="mt-4 space-y-3">
            {pendingInvitations.map((inv) => (
              <div
                key={inv.id}
                className="flex items-center justify-between border p-3"
              >
                <div>
                  <p className="text-sm font-medium">
                    {inv.organizationName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Role:{" "}
                    <span
                      className={`font-mono ${
                        inv.role === "owner" || inv.role === "admin"
                          ? "text-chart-3"
                          : "text-muted-foreground"
                      }`}
                    >
                      {inv.role}
                    </span>
                  </p>
                </div>
                <Button
                  size="sm"
                  className="gap-1.5"
                  onClick={() => handleAcceptInvitation(inv.id)}
                >
                  <LogInIcon className="size-3.5" />
                  Accept
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

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