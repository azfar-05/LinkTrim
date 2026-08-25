"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  AlertTriangleIcon,
  CopyIcon,
  CheckIcon,
  KeyIcon,
  PlusIcon,
  ShieldOffIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react";

import { Button } from "@LinkTrim/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@LinkTrim/ui/components/card";
import {
  Dialog,
  DialogPopup,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@LinkTrim/ui/components/dialog";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@LinkTrim/ui/components/empty";
import { Input } from "@LinkTrim/ui/components/input";
import { Label } from "@LinkTrim/ui/components/label";
import { Skeleton } from "@LinkTrim/ui/components/skeleton";
import { useOrganization } from "@/context/organization-context";
import { authClient } from "@/lib/auth-client";

type ApiKeyRow = {
  id: string;
  name: string;
  prefix: string;
  lastUsedAt: string | null;
  expiresAt: string | null;
  revokedAt: string | null;
  createdAt: string;
  createdByName: string;
};

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatRelative(iso: string | null) {
  if (!iso) return null;
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 60_000) return "just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  if (diff < 2_592_000_000) return `${Math.floor(diff / 86_400_000)}d ago`;
  return formatDate(iso);
}

function KeyRevealDialog({
  open,
  onOpenChange,
  name,
  plaintext,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  name: string;
  plaintext: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(plaintext);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPopup>
        <DialogHeader>
          <DialogTitle>API Key Created</DialogTitle>
          <DialogDescription>
            Copy your API key now. You won&apos;t be able to see it again.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
            <div className="flex items-start gap-2">
              <AlertTriangleIcon className="mt-0.5 size-4 shrink-0 text-amber-500" />
              <p className="text-xs text-amber-600 dark:text-amber-400">
                This is the only time you&apos;ll see this key. Save it somewhere
                safe — it cannot be recovered.
              </p>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Key for &ldquo;{name}&rdquo;</Label>
            <div className="flex gap-2">
              <code className="flex-1 truncate rounded-md border bg-muted/50 px-3 py-2 font-mono text-xs">
                {plaintext}
              </code>
              <Button
                variant="outline"
                size="icon-sm"
                onClick={handleCopy}
                className="shrink-0"
              >
                {copied ? (
                  <CheckIcon className="size-3.5 text-chart-3" />
                ) : (
                  <CopyIcon className="size-3.5" />
                )}
              </Button>
            </div>
          </div>

          <p className="text-[11px] text-muted-foreground">
            Example:{" "}
            <code className="rounded bg-muted/50 px-1 py-0.5 font-mono">
              curl -H &quot;Authorization: Bearer {plaintext.slice(0, 16)}...&quot;
            </code>
          </p>
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Done</Button>
        </DialogFooter>
      </DialogPopup>
    </Dialog>
  );
}

export default function ApiKeysPage() {
  const org = useOrganization();
  const { data: session } = authClient.useSession();

  const currentUserMember = org?.members?.find(
    (m: { userId: string; role: string }) => m.userId === session?.user?.id,
  );
  const isOwner = currentUserMember?.role === "owner";

  const [keys, setKeys] = useState<ApiKeyRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [createOpen, setCreateOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyExpires, setNewKeyExpires] = useState("");
  const [creating, setCreating] = useState(false);

  const [revealData, setRevealData] = useState<{
    name: string;
    key: string;
  } | null>(null);

  const [revokingId, setRevokingId] = useState<string | null>(null);

  const fetchKeys = async () => {
    try {
      const res = await fetch(
        `/api/api-keys?organizationSlug=${org.slug}`,
      );
      if (res.ok) {
        const data = await res.json();
        setKeys(data);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (org?.slug) fetchKeys();
  }, [org?.slug]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;
    setCreating(true);

    try {
      const res = await fetch("/api/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationSlug: org.slug,
          name: newKeyName.trim(),
          expiresAt: newKeyExpires
            ? new Date(newKeyExpires).toISOString()
            : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to create API key");
        return;
      }

      setRevealData({ name: data.name, key: data.key });
      setCreateOpen(false);
      setNewKeyName("");
      setNewKeyExpires("");
      toast.success("API key created");
      await fetchKeys();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setCreating(false);
    }
  };

  const handleRevoke = async (keyId: string, name: string) => {
    setRevokingId(keyId);

    try {
      const res = await fetch("/api/api-keys", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationSlug: org.slug,
          keyId,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Failed to revoke API key");
        return;
      }

      toast.success(`"${name}" revoked`);
      await fetchKeys();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setRevokingId(null);
    }
  };

  if (!isOwner) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            API Keys<span className="text-chart-3">.</span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage API keys for programmatic access.
          </p>
        </div>

        <Card>
          <CardContent className="flex items-center gap-3 py-8">
            <ShieldOffIcon className="size-5 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Only the organization owner can manage API keys.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const activeKeys = keys.filter((k) => !k.revokedAt);
  const revokedKeys = keys.filter((k) => k.revokedAt);

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Workspace
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight">
            API Keys<span className="text-chart-3">.</span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create and manage API keys for programmatic link creation.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="gap-1.5">
          <PlusIcon className="size-4" />
          New Key
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyIcon className="size-4" />
            How API Keys Work
          </CardTitle>
          <CardDescription>
            Use API keys to create short links from your own applications
            without the dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border bg-muted/30 p-4 font-mono text-xs leading-relaxed">
            <p className="text-muted-foreground">
              curl -X POST {typeof window !== "undefined" ? window.location.origin : ""}/api/links \
            </p>
            <p className="pl-4">
              -H &quot;Authorization: Bearer lt_your_api_key&quot; \
            </p>
            <p className="pl-4">
              -H &quot;Content-Type: application/json&quot; \
            </p>
            <p className="pl-4">
              -d &apos;&#123;&quot;organizationSlug&quot;:
              &quot;{org.slug}&quot;, &quot;originalUrl&quot;:
              &quot;https://example.com&quot;&#125;&apos;
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight">
          Active Keys
          {activeKeys.length > 0 && (
            <span className="ml-1.5 text-sm font-normal text-muted-foreground">
              ({activeKeys.length})
            </span>
          )}
        </h2>

        {loading ? (
          <Card className="gap-0 py-0">
            {[...Array(2)].map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-4 border-b px-4 py-3.5 last:border-0"
              >
                <Skeleton className="h-4 w-24 rounded-md" />
                <Skeleton className="h-4 flex-1 rounded-md" />
                <Skeleton className="h-4 w-20 rounded-md" />
              </div>
            ))}
          </Card>
        ) : activeKeys.length === 0 ? (
          <Empty className="rounded-xl border border-dashed border-border bg-card/30 py-14">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <KeyIcon className="size-5" />
              </EmptyMedia>
              <EmptyTitle>No API keys</EmptyTitle>
              <EmptyDescription>
                Create an API key to start building with the LinkTrim API.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <Card className="overflow-x-auto py-0">
            <table className="w-full text-xs sm:text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">
                    Name
                  </th>
                  <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">
                    Prefix
                  </th>
                  <th className="hidden px-4 py-2.5 text-left font-medium text-muted-foreground sm:table-cell">
                    Created
                  </th>
                  <th className="hidden px-4 py-2.5 text-left font-medium text-muted-foreground md:table-cell">
                    Last Used
                  </th>
                  <th className="hidden px-4 py-2.5 text-left font-medium text-muted-foreground lg:table-cell">
                    Expires
                  </th>
                  <th className="px-4 py-2.5 text-right font-medium text-muted-foreground">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {activeKeys.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b transition-colors last:border-0 hover:bg-muted/40"
                  >
                    <td className="whitespace-nowrap px-4 py-3 font-medium">
                      {row.name}
                    </td>
                    <td className="px-4 py-3">
                      <code className="rounded-md bg-muted/50 px-2 py-0.5 font-mono text-xs">
                        {row.prefix}...
                      </code>
                    </td>
                    <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">
                      {formatDate(row.createdAt)}
                    </td>
                    <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                      {row.lastUsedAt
                        ? formatRelative(row.lastUsedAt)
                        : "never"}
                    </td>
                    <td className="hidden px-4 py-3 text-muted-foreground lg:table-cell">
                      {formatDate(row.expiresAt)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleRevoke(row.id, row.name)}
                        disabled={revokingId === row.id}
                        title="Revoke key"
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2Icon className="size-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}
      </div>

      {revokedKeys.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold tracking-tight text-muted-foreground">
            Revoked
            <span className="ml-1.5 text-sm font-normal">
              ({revokedKeys.length})
            </span>
          </h2>

          <Card className="overflow-x-auto py-0 opacity-60">
            <table className="w-full text-xs sm:text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">
                    Name
                  </th>
                  <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">
                    Prefix
                  </th>
                  <th className="hidden px-4 py-2.5 text-left font-medium text-muted-foreground sm:table-cell">
                    Created
                  </th>
                  <th className="hidden px-4 py-2.5 text-left font-medium text-muted-foreground md:table-cell">
                    Revoked
                  </th>
                </tr>
              </thead>
              <tbody>
                {revokedKeys.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b last:border-0"
                  >
                    <td className="whitespace-nowrap px-4 py-3 font-medium">
                      {row.name}
                    </td>
                    <td className="px-4 py-3">
                      <code className="rounded-md bg-muted/50 px-2 py-0.5 font-mono text-xs">
                        {row.prefix}...
                      </code>
                    </td>
                    <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">
                      {formatDate(row.createdAt)}
                    </td>
                    <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                      {formatDate(row.revokedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      )}

      {/* Create dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogPopup>
          <DialogHeader>
            <DialogTitle>Create API Key</DialogTitle>
            <DialogDescription>
              Generate a new key for programmatic access to the LinkTrim API.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="key-name">Name</Label>
              <Input
                id="key-name"
                placeholder="e.g. Zapier integration, CI/CD pipeline"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                required
                maxLength={100}
              />
              <p className="text-[11px] text-muted-foreground">
                A label to identify what this key is used for.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="key-expires">Expires at (optional)</Label>
              <Input
                id="key-expires"
                type="datetime-local"
                value={newKeyExpires}
                onChange={(e) => setNewKeyExpires(e.target.value)}
              />
              <p className="text-[11px] text-muted-foreground">
                Leave empty for a key that never expires.
              </p>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={creating}>
                {creating ? "Creating..." : "Create Key"}
              </Button>
            </DialogFooter>
          </form>
        </DialogPopup>
      </Dialog>

      {/* Key reveal dialog */}
      <KeyRevealDialog
        open={!!revealData}
        onOpenChange={(open) => {
          if (!open) setRevealData(null);
        }}
        name={revealData?.name ?? ""}
        plaintext={revealData?.key ?? ""}
      />
    </div>
  );
}
