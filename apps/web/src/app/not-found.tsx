import Link from "next/link";
import { Link2 } from "lucide-react";

import { Button } from "@LinkTrim/ui/components/button";

export default function NotFound() {
  return (
    <div className="relative flex min-h-[70vh] flex-col items-center justify-center gap-6 overflow-hidden px-4 text-center">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 [background-image:radial-gradient(var(--color-muted-foreground)_1px,transparent_1px)] [background-size:22px_22px] opacity-[0.13] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,black,transparent)]"
      />

      <div className="relative flex items-center gap-2 font-mono text-sm font-semibold">
        <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <Link2 className="size-4" />
        </span>
        <span>linktrim</span>
      </div>

      <h1 className="relative text-5xl font-bold tracking-tight tabular-nums">
        404
      </h1>

      <div className="relative">
        <p className="text-lg font-semibold">This link doesn&apos;t exist<span className="text-chart-3">.</span></p>
        <p className="mt-1 max-w-md text-sm text-muted-foreground">
          It may have expired, been disabled, or never existed at all.
        </p>
      </div>

      <Link href="/" className="relative">
        <Button variant="outline">Go Home</Button>
      </Link>
    </div>
  );
}
