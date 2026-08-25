"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { Button } from "@LinkTrim/ui/components/button";
import { Skeleton } from "@LinkTrim/ui/components/skeleton";

import { authClient } from "@/lib/auth-client";

export function GetStartedButton() {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return <Skeleton className="h-10 w-36" />;
  }

  return (
    <Link href={session ? "/orgs" : "/login"}>
      <Button size="lg">
        Get Started
        <ChevronRight className="ml-1 h-4 w-4" />
      </Button>
    </Link>
  );
}
