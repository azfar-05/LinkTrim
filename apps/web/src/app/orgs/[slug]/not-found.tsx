import Link from "next/link";

import { Button } from "@LinkTrim/ui/components/button";

export default function notFound() {
  return (
    <main className="flex min-h-[70vh] flex-col items-center justify-center gap-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Organization not found</h1>

        <p className="mt-2 text-muted-foreground">
          This workspace doesn't exist or you don't have access to it.
        </p>
      </div>

      <Link href="/orgs">
        <Button>Back to Dashboard</Button>
      </Link>
    </main>
  );
}
