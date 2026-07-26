import { headers } from "next/headers";
import Link from "next/link";

import { auth } from "@LinkTrim/auth";
import { Button } from "@LinkTrim/ui/components/button";
import {
  SidebarInset,
  SidebarProvider,
} from "@LinkTrim/ui/components/sidebar";

import OrgSidebar from "@/components/org-sidebar";
import { OrganizationProvider } from "@/context/organization-context";

export default async function OrganizationLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const organization = await auth.api
    .getFullOrganization({
      headers: await headers(),
      query: {
        organizationSlug: slug,
      },
    })
    .catch(() => null);

  if (!organization || organization.slug !== slug) {
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

  return (
    <OrganizationProvider organization={organization}>
      <SidebarProvider defaultOpen>
        <OrgSidebar />

        <SidebarInset>
          <main className="flex min-h-screen flex-col p-6">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </OrganizationProvider>
  );
}
