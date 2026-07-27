"use client";
import Link from "next/link";
import { Link2 } from "lucide-react";

import { ModeToggle } from "./mode-toggle";
import UserMenu from "./user-menu";

export default function Header() {
  const links = [
    { to: "/", label: "Home" },
    { to: "/orgs", label: "Organizations" },
  ] as const;

  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Link2 className="h-5 w-5" />
            <span>LinkTrim</span>
          </Link>
          <nav className="flex gap-4 text-sm">
            {links.map(({ to, label }) => (
              <Link
                key={to}
                href={to}
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <ModeToggle />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
