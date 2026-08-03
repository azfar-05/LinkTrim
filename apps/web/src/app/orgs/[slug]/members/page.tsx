"use client";

import { useState } from "react";
import { RoleBadge } from "@/components/role-badge";
import { authClient } from "@/lib/auth-client";
import { useOrganization } from "@/context/organization-context";
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

  const currentUserMember = members.find(
    (m) => m.userId === session?.user?.id
  );
  const isAdmin = isAdminRole(currentUserMember?.role ?? "");

  const [invitations, setInvitations] = useState<any[]>(
    org?.invitations?.filter((i: any) => i.status === "pending") ?? []
  );

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
          data.invitations.filter((i: any) => i.status === "pending")
        );
    } catch {
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
        <h1 className="text-2xl font-bold tracking-tight">Members</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage members of your organization.
        </p>
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
              <Button type="submit" disabled={inviting}>
                {inviting ? "Inviting…" : "Invite"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {isAdmin && invitations.length > 0 && (
        <div className="border p-5">
          <h2 className="text-sm font-semibold tracking-tight">
            Pending Invitations
            <span className="ml-1.5 text-muted-foreground">
              ({invitations.length})
            </span>
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Awaiting response from invitees.
          </p>
          <div className="mt-3 space-y-2">
            {invitations.map((inv) => (
              <div
                key={inv.id}
                className="flex items-center justify-between border p-3 text-sm"
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
                  className="text-destructive hover:text-destructive"
                >
                  Cancel
                </Button>
              </div>
            ))}
          </div>
        </div>
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
          <div className="mt-3 overflow-x-auto border">
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
                      {member.user.name}
                      {member.userId === session?.user?.id && (
                        <span className="ml-1.5 text-xs text-muted-foreground">
                          (you)
                        </span>
                      )}
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
                              <span className="text-xs">
                                {member.role === "member" ? "↑" : "↓"}
                              </span>
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
                              <span className="text-xs">&times;</span>
                            </Button>
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}