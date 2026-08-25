"use client";

import { useEffect, useState } from "react";
import { RoleBadge } from "@/components/role-badge";
import { authClient } from "@/lib/auth-client";
import { useOrganization } from "@/context/organization-context";
import type { OrganizationInvitation } from "@/context/organization-context";
import { isAdminRole } from "@/lib/roles";
import { Button } from "@LinkTrim/ui/components/button";
import { Input } from "@LinkTrim/ui/components/input";
import { Label } from "@LinkTrim/ui/components/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@LinkTrim/ui/components/card";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  UserPlusIcon,
  XIcon,
} from "lucide-react";
import { toast } from "sonner";

type MemberRow = {
  id: string;
  userId: string;
  role: string;
  createdAt: Date | string;
  user: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  };
};

export default function MembersPage() {
  const org = useOrganization();
  const { data: session } = authClient.useSession();
  const [members, setMembers] = useState<MemberRow[]>(org?.members ?? []);
  const [email, setEmail] = useState("");
  const [inviting, setInviting] = useState(false);

  // Re-sync when the organization context changes (e.g. navigation or a
  // refetch elsewhere) instead of keeping a permanently stale copy.
  useEffect(() => {
    if (org?.members) {
      setMembers(org.members as MemberRow[]);
    }
  }, [org?.members]);

  const [invitations, setInvitations] = useState<OrganizationInvitation[]>(
    org?.invitations?.filter((i) => i.status === "pending") ?? []
  );

  useEffect(() => {
    if (org?.invitations) {
      setInvitations(
        org.invitations.filter((i) => i.status === "pending")
      );
    }
  }, [org?.invitations]);

  const currentUserMember = members.find(
    (m) => m.userId === session?.user?.id
  );
  const isAdmin = isAdminRole(currentUserMember?.role ?? "");

  const refreshMembers = async () => {
    try {
      const { data, error } =
        await authClient.organization.getFullOrganization({
          query: { organizationSlug: org.slug },
        });
      if (error) return;
      if (data?.members) setMembers(data.members as MemberRow[]);
      if (data?.invitations)
        setInvitations(
          (
            data.invitations as OrganizationInvitation[]
          ).filter((i) => i.status === "pending")
        );    } catch {
      // silent
    }
  };

  const handleCancelInvitation = async (invitationId: string) => {
    const { error } = await authClient.organization.cancelInvitation({
      invitationId,
    });
    if (error) {
      toast.error(error.message || "Failed to cancel invitation");
      return;
    }
    toast.success("Invitation cancelled");
    await refreshMembers();
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setInviting(true);
    const { error } = await authClient.organization.inviteMember({
      email: email.trim(),
      role: "member",
      organizationId: org.id,
    });
    setInviting(false);
    if (error) {
      toast.error(error.message || "Failed to invite member");
      return;
    }
    toast.success(`Invitation sent to ${email.trim()}`);
    setEmail("");
    await refreshMembers();
  };

  const handleRemove = async (memberId: string, name: string) => {
    const { error } = await authClient.organization.removeMember({
      memberIdOrEmail: memberId,
      organizationId: org.id,
    });
    if (error) {
      toast.error(error.message || "Failed to remove member");
      return;
    }
    toast.success(`${name} removed from organization`);
    await refreshMembers();
  };

  const handleRoleChange = async (memberId: string, newRole: string) => {
    const { error } = await authClient.organization.updateMemberRole({
      memberId,
      role: newRole,
      organizationId: org.id,
    });
    if (error) {
      toast.error(error.message || "Failed to update role");
      return;
    }
    toast.success(`Role updated to ${newRole}`);
    await refreshMembers();
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Members<span className="text-chart-3">.</span>
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage members of your organization.
        </p>

        {members.length > 0 || invitations.length > 0 ? (
          <div className="mt-3 flex flex-wrap items-center gap-2 font-mono text-[11px] tabular-nums text-muted-foreground">
            <span className="rounded-md border bg-muted/40 px-2 py-0.5">
              {members.length} {members.length === 1 ? "member" : "members"}
            </span>
            <span className="rounded-md border bg-muted/40 px-2 py-0.5">
              {members.filter((m) => isAdminRole(m.role)).length}{" "}
              {members.filter((m) => isAdminRole(m.role)).length === 1
                ? "admin"
                : "admins"}
            </span>
            {invitations.length > 0 && (
              <span className="rounded-md border border-chart-3/30 bg-chart-3/10 px-2 py-0.5 text-chart-3">
                {invitations.length} pending
              </span>
            )}
          </div>
        ) : null}
      </div>

      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle>Invite Member</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleInvite} className="flex gap-2">
              <div className="flex-1">
                <Label htmlFor="invite-email" className="sr-only">
                  Email address
                </Label>
                <Input
                  id="invite-email"
                  type="email"
                  placeholder="colleague@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" disabled={inviting} className="gap-1.5">
                <UserPlusIcon className="size-4" />
                {inviting ? "Inviting…" : "Invite"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {isAdmin && invitations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>
              Pending Invitations
              <span className="ml-1.5 font-normal text-muted-foreground">
                ({invitations.length})
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {invitations.map((inv) => (
              <div
                key={inv.id}
                className="flex items-center justify-between rounded-lg border bg-background p-3 text-sm"
              >
                <div>
                  <p className="font-medium">{inv.email}</p>
                  <span className="font-mono text-xs text-muted-foreground">
                    {inv.role}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCancelInvitation(inv.id)}
                  className="gap-1 text-destructive hover:text-destructive"
                >
                  <XIcon className="size-3.5" />
                  Cancel
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div>
        <h2 className="text-lg font-semibold tracking-tight">
          All Members
          {members.length > 0 && (
            <span className="ml-1.5 text-muted-foreground">
              ({members.length})
            </span>
          )}
        </h2>

        {members.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">No members.</p>
        ) : (
          <Card className="mt-3 overflow-x-auto py-0">
            <table className="w-full text-xs sm:text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">
                    Name
                  </th>
                  <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">
                    Email
                  </th>
                  <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">
                    Role
                  </th>
                  <th className="hidden px-4 py-2.5 text-left font-medium text-muted-foreground sm:table-cell">
                    Joined
                  </th>
                  {isAdmin && (
                    <th className="px-4 py-2.5 text-right font-medium text-muted-foreground">
                      <span className="sr-only">Actions</span>
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {members.map((member) => (
                  <tr key={member.id} className="border-b last:border-0">
                    <td className="px-4 py-3 font-medium">
                      <div className="flex items-center gap-2.5">
                        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary">
                          {member.user.name.charAt(0).toUpperCase()}
                        </span>
                        {member.user.name}
                        {member.userId === session?.user?.id && (
                          <span className="text-xs font-normal text-muted-foreground">
                            (you)
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {member.user.email}
                    </td>
                    <td className="px-4 py-3">
                      <RoleBadge role={member.role} />
                    </td>
                    <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">
                      {new Date(member.createdAt).toLocaleDateString()}
                    </td>
                    {isAdmin && (
                      <td className="px-4 py-3 text-right">
                        {member.userId !== session?.user?.id && (
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() =>
                                handleRoleChange(
                                  member.id,
                                  member.role === "member"
                                    ? "admin"
                                    : "member"
                                )
                              }
                              title={
                                member.role === "member"
                                  ? "Promote to admin"
                                  : "Demote to member"
                              }
                            >
                              {member.role === "member" ? (
                                <ArrowUpIcon className="size-3.5" />
                              ) : (
                                <ArrowDownIcon className="size-3.5" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() =>
                                handleRemove(member.id, member.user.name)
                              }
                              title="Remove member"
                              className="text-destructive hover:text-destructive"
                            >
                              <XIcon className="size-3.5" />
                            </Button>
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}
      </div>
    </div>
  );
}