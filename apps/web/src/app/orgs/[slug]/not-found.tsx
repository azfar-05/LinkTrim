import Link from "next/link";

import { Button } from "@LinkTrim/ui/components/button";
import { CompassIcon } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 px-4 text-center">
      <span className="flex size-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
        <CompassIcon className="size-6" />
      </span>
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Organization not found
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This workspace doesn&apos;t exist or you don&apos;t have access to
          it.
        </p>
      </div>
      <Link href="/orgs">
        <Button>Back to Dashboard</Button>
      </Link>
    </div>
  );
}
