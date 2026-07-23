"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogPopup, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@LinkTrim/ui/components/dialog";
import { Button } from "@LinkTrim/ui/components/button";
import { Input } from "@LinkTrim/ui/components/input";
import { Label } from "@LinkTrim/ui/components/label";

interface CreateOrgDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (data: { name: string; slug: string }) => void;
}

export default function CreateOrgDialog({
  open,
  onOpenChange,
  onCreate,
}: CreateOrgDialogProps) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [isSlugEdited, setIsSlugEdited] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; slug?: string }>({});

  const slugify = (text: string) => {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-") // Replace spaces with -
      .replace(/[^\w\-]+/g, "") // Remove all non-word chars
      .replace(/\-\-+/g, "-") // Replace multiple - with single -
      .replace(/^-+/, "") // Trim - from start of text
      .replace(/-+$/, ""); // Trim - from end of text
  };

  // Auto-generate slug when name changes, if user hasn't manually edited it
  useEffect(() => {
    if (!isSlugEdited) {
      setSlug(slugify(name));
    }
  }, [name, isSlugEdited]);

  // Reset state when dialog closes/opens
  useEffect(() => {
    if (!open) {
      setName("");
      setSlug("");
      setIsSlugEdited(false);
      setErrors({});
    }
  }, [open]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    if (errors.name) {
      setErrors((prev) => ({ ...prev, name: undefined }));
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsSlugEdited(true);
    setSlug(e.target.value);
    if (errors.slug) {
      setErrors((prev) => ({ ...prev, slug: undefined }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { name?: string; slug?: string } = {};

    if (!name.trim()) {
      newErrors.name = "Organization name is required.";
    }
    if (!slug.trim()) {
      newErrors.slug = "Slug is required.";
    } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      newErrors.slug = "Slug must contain only lowercase letters, numbers, and hyphens.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onCreate({ name: name.trim(), slug: slug.trim() });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPopup className="max-w-md bg-card">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">Create Organization</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-1">
              Create a workspace to manage and track your links.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="org-name" className="text-xs font-medium">
                Organization Name
              </Label>
              <Input
                id="org-name"
                type="text"
                placeholder="Acme Corp"
                value={name}
                onChange={handleNameChange}
                className={errors.name ? "border-destructive focus-visible:ring-destructive/30" : ""}
                autoFocus
              />
              {errors.name && (
                <span className="text-[10px] text-destructive font-medium">{errors.name}</span>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="org-slug" className="text-xs font-medium">
                Slug
              </Label>
              <div className="flex items-center">
                <span className="inline-flex h-8 items-center border border-r-0 border-input bg-muted px-2.5 font-mono text-[10px] text-muted-foreground select-none">
                  linktrim.to/
                </span>
                <Input
                  id="org-slug"
                  type="text"
                  placeholder="acme-corp"
                  value={slug}
                  onChange={handleSlugChange}
                  className={errors.slug ? "border-destructive focus-visible:ring-destructive/30" : ""}
                />
              </div>
              <p className="text-[10px] text-muted-foreground">
                This is your workspace's unique address on LinkTrim.
              </p>
              {errors.slug && (
                <span className="text-[10px] text-destructive font-medium">{errors.slug}</span>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              Create Workspace
            </Button>
          </DialogFooter>
        </form>
      </DialogPopup>
    </Dialog>
  );
}
