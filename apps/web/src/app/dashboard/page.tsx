import { auth } from "@LinkTrim/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import Dashboard from "./dashboard";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <main className="w-full h-full bg-background/50">
      <Dashboard session={session} />
    </main>
  );
}
