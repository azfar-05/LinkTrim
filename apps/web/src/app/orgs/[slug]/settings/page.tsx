"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { RoleBadge } from "@/components/role-badge";
import { authClient } from "@/lib/auth-client";
import { useOrganization } from "@/context/organization-context";
import { isReservedSlug, reservedSlugMessage } from "@LinkTrim/auth/reserved-slugs";
import { isAdminRole } from "@/lib/roles";
import { isValidOrgSlug, ORG_SLUG_INVALID_MESSAGE } from "@/lib/slugs";
import { Button } from "@LinkTrim/ui/components/button";
import { Input } from "@LinkTrim/ui/components/input";
import { Label } from "@LinkTrim/ui/components/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@LinkTrim/ui/components/card";import {
  Dialog,
  DialogPopup,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@LinkTrim/ui/components/dialog";
import { toast } from "sonner";
import {
  Settings2Icon,
  TriangleAlertIcon,
  UserRoundIcon,
} from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const org = useOrganization();
  const { data: session } = authClient.useSession();

  const currentUserMember = org?.members?.find(
    (m) => m.userId === session?.user?.id
  );
  const role: string = currentUserMember?.role ?? "member";
  const isAdmin = isAdminRole(role);
  const isOwner = role === "owner";

  const [name, setName] = useState(org?.name ?? "");
  const [slug, setSlug] = useState(org?.slug ?? "");
  const [saving, setSaving] = useState(false);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) return;
    if (!isValidOrgSlug(slug.trim())) {
      toast.error(ORG_SLUG_INVALID_MESSAGE);
      return;
    }
    if (isReservedSlug(slug.trim())) {
      toast.error(reservedSlugMessage(slug.trim()));
      return;
    }

    setSaving(true);
    const { data, error } = await authClient.organization.update({
      organizationId: org.id,
      data: {
        name: name.trim(),
        slug: slug.trim(),
      },
    });
    setSaving(false);

    if (error) {
      toast.error(error.message || "Failed to update organization");
      return;
    }

    toast.success("Organization updated");
    if (data?.slug && data.slug !== org.slug) {
      router.push(`/orgs/${data.slug}/settings`);
    }
  };

  const handleLeave = async () => {
    setLeaving(true);
    const { error } = await authClient.organization.leave({
      organizationId: org.id,
    });
    setLeaving(false);

    if (error) {
      toast.error(error.message || "Failed to leave organization");
      return;
    }

    toast.success("You left the organization");
    router.push("/orgs");
  };

  const handleDelete = async () => {
    setDeleting(true);
    const { error } = await authClient.organization.delete({
      organizationId: org.id,
    });
    setDeleting(false);

    if (error) {
      toast.error(error.message || "Failed to delete organization");
      return;
    }

    toast.success("Organization deleted");
    router.push("/orgs");
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your organization and membership.
        </p>
      </div>

      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings2Icon className="size-4 text-muted-foreground" />
              General
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="flex flex-col gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="settings-name" className="text-xs font-medium">
                    Organization Name
                  </Label>
                  <Input
                    id="settings-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={saving}
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="settings-slug" className="text-xs font-medium">
                    Slug
                  </Label>
                  <div className="flex items-center">
                    <span className="inline-flex h-8 select-none items-center border border-r-0 border-input bg-muted px-2.5 font-mono text-[10px] text-muted-foreground">
                      /orgs/
                    </span>
                    <Input
                      id="settings-slug"
                      type="text"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      disabled={saving}
                      required
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    Changing the slug changes your workspace URL.
                  </p>
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={saving}>
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserRoundIcon className="size-4 text-muted-foreground" />
            Your Membership
          </CardTitle>
          <CardDescription>
            You are a member of this organization.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Your role:</span>
              <RoleBadge role={role} />
            </div>

            {role === "member" && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setLeaveOpen(true)}
              >
                Leave organization
              </Button>
            )}
          </div>

          {role === "admin" && (
            <p className="mt-2 text-xs text-muted-foreground">
              Admins can&apos;t leave an organization yet.
            </p>
          )}

          {isOwner && (
            <p className="mt-2 text-xs text-muted-foreground">
              Owners can&apos;t leave. Delete the organization instead.
            </p>
          )}
        </CardContent>
      </Card>

      {isOwner && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <TriangleAlertIcon className="size-4" />
              Danger Zone
            </CardTitle>
            <CardDescription>
              Delete this organization, its links, and all click analytics. This
              action cannot be undone.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setDeleteOpen(true)}
              className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              Delete organization
            </Button>
          </CardContent>
        </Card>
      )}

      <Dialog open={leaveOpen} onOpenChange={setLeaveOpen}>
        <DialogPopup className="max-w-md bg-card">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">
              Leave {org.name}?
            </DialogTitle>
            <DialogDescription className="mt-1 text-xs text-muted-foreground">
              You will lose access to this organization and its links. You can
              be re-invited by an admin.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={leaving}
              onClick={() => setLeaveOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={leaving}
              onClick={handleLeave}
              className="text-destructive hover:text-destructive"
            >
              {leaving ? "Leaving..." : "Leave organization"}
            </Button>
          </DialogFooter>
        </DialogPopup>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogPopup className="max-w-md bg-card">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">
              Delete {org.name}?
            </DialogTitle>
            <DialogDescription className="mt-1 text-xs text-muted-foreground">
              This permanently deletes the organization, all members, links,
              and analytics. Type{" "}
              <span className="font-mono text-foreground">{org.name}</span> to
              confirm.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-1.5 py-2">
            <Label htmlFor="delete-confirm" className="text-xs font-medium">
              Type the organization name
            </Label>
            <Input
              id="delete-confirm"
              type="text"
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              disabled={deleting}
              placeholder={org.name}
              className="border-destructive focus-visible:ring-destructive/30"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={deleting}
              onClick={() => {
                setDeleteOpen(false);
                setDeleteConfirm("");
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={deleting || deleteConfirm !== org.name}
              onClick={handleDelete}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {deleting ? "Deleting..." : "Delete organization"}
            </Button>
          </DialogFooter>
        </DialogPopup>
      </Dialog>
    </div>
  );
}
