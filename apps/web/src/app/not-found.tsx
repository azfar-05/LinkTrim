import Link from "next/link";
import { Link2 } from "lucide-react";

import { Button } from "@LinkTrim/ui/components/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="flex items-center gap-2 text-sm font-semibold">
        <Link2 className="h-4 w-4" />
        <span>LinkTrim</span>
      </div>
      <h1 className="text-4xl font-bold tracking-tight">Link not found</h1>
      <p className="max-w-md text-muted-foreground">
        This link doesn&apos;t exist, has expired, or has been disabled.
      </p>
      <Link href="/">
        <Button variant="outline">Go Home</Button>
      </Link>
    </div>
  );
}