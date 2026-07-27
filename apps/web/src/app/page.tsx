import Link from "next/link";
import { Link2 } from "lucide-react";

import { GetStartedButton } from "@/components/get-started-button";

const linkRows = [
  { slug: "summer-launch", clicks: "12,847", last: "Today, 9:41 AM" },
  { slug: "deal-page", clicks: "1,892", last: "Yesterday, 3:15 PM" },
  { slug: "abc123f", clicks: "4,561", last: "Jul 24, 2026" },
  { slug: "internal-note", clicks: "312", last: "Jul 22, 2026" },
  { slug: "launch-week", clicks: "8,923", last: "Jul 20, 2026" },
];

export default function Home() {
  return (
    <main>
      <Hero />
      <Features />
      <Analytics />
      <Roles />
      <CTAFooter />
    </main>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden px-4 pb-16 pt-20 sm:pb-24 sm:pt-28">
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_bottom,var(--color-primary)_0%,transparent_50%)] opacity-[0.03]" />
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          Short links for{" "}
          <span className="text-chart-3">your team</span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-base text-muted-foreground sm:text-lg">
          Invite-only URL shortener with custom slugs, per-click analytics, and
          role-based access — one shared workspace for your organization.
        </p>
        <div className="mt-8">
          <GetStartedButton />
        </div>
      </div>
    </section>
  );
}

function Features() {
  return (
    <section className="border-t px-4 py-20 sm:py-28">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
          What you get
        </h2>
        <div className="mt-12 grid gap-16 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <div className="border p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center border bg-chart-3/10">
                  <Link2 className="h-5 w-5 text-chart-3" />
                </div>
                <div>
                  <h3 className="font-semibold">Custom & random slugs</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">
                    Choose a memorable slug like{" "}
                    <span className="font-mono text-foreground">
                      linktrim.to/sale
                    </span>{" "}
                    or let LinkTrim generate a random one. Expiring, scheduled,
                    and click-capped links built in.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="lg:col-span-2">
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-chart-3" />
                <div>
                  <span className="font-medium">Scheduled & expiring</span>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    Set links to activate or expire on specific dates.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-chart-3" />
                <div>
                  <span className="font-medium">Click-cap enforcement</span>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    Limit total clicks per link. Auto-disable when the cap is
                    reached.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-chart-3" />
                <div>
                  <span className="font-medium">Bot-filtered analytics</span>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    Every click is cleaned in real time — bot traffic is
                    detected and excluded.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-chart-3" />
                <div>
                  <span className="font-medium">Recharts dashboard</span>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    Interactive charts for clicks over time, top links, and
                    member breakdowns.
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function Analytics() {
  return (
    <section className="border-t px-4 py-20 sm:py-28">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
          Per-click data, no noise
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-center text-muted-foreground">
          Every click logs device, referrer, and location. Bots are stripped
          automatically so your numbers stay honest.
        </p>
        <div className="mt-10 overflow-hidden border">
          <table className="w-full text-xs sm:text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">
                  Short link
                </th>
                <th className="px-4 py-2.5 text-right font-medium text-muted-foreground">
                  Clicks
                </th>
                <th className="hidden px-4 py-2.5 text-right font-medium text-muted-foreground sm:table-cell">
                  Last click
                </th>
              </tr>
            </thead>
            <tbody>
              {linkRows.map((row) => (
                <tr key={row.slug} className="border-b last:border-0">
                  <td className="px-4 py-3 font-mono text-xs sm:text-sm">
                    linktrim.to/{row.slug}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-xs sm:text-sm">
                    {row.clicks}
                  </td>
                  <td className="hidden px-4 py-3 text-right text-muted-foreground sm:table-cell">
                    {row.last}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function Roles() {
  return (
    <section className="border-t px-4 py-20 sm:py-28">
      <div className="mx-auto max-w-3xl">
        <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
          Two roles, one workspace
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-center text-muted-foreground">
          Every member belongs to the same organization. What you see depends
          on your role.
        </p>
        <div className="mt-10 grid sm:grid-cols-2">
          <div className="border-r-0 border p-6 sm:border-r">
            <div className="inline border bg-chart-3/10 px-2 py-0.5 font-mono text-xs text-chart-3">
              admin
            </div>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-chart-3">&#10003;</span>
                All links in the organization
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-chart-3">&#10003;</span>
                Per-member analytics breakdown
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-chart-3">&#10003;</span>
                Manage settings & invite members
              </li>
            </ul>
          </div>
          <div className="border p-6">
            <div className="inline border bg-muted/50 px-2 py-0.5 font-mono text-xs text-muted-foreground">
              member
            </div>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-chart-3">&#10003;</span>
                Own links only
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-chart-3">&#10003;</span>
                Personal click analytics
              </li>
              <li className="flex items-start gap-2 text-muted-foreground/50">
                <span className="mt-0.5">&mdash;</span>
                Cannot see other members&apos; links
              </li>
            </ul>
          </div>
        </div>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Access is invite-only. New members are assigned the{" "}
          <span className="font-mono text-foreground">member</span> role by
          default.
        </p>
      </div>
    </section>
  );
}

function CTAFooter() {
  return (
    <footer>
      <section className="border-t px-4 py-20 sm:py-28">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to start?
          </h2>
          <p className="mt-4 text-muted-foreground">
            LinkTrim is invite-only. Request access or sign in if you&apos;re
            already a member.
          </p>
          <div className="mt-8">
            <GetStartedButton />
          </div>
        </div>
      </section>
      <div className="border-t px-4 py-8">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Link2 className="h-4 w-4" />
            <span>LinkTrim</span>
          </div>
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} LinkTrim.
          </p>
        </div>
      </div>
    </footer>
  );
}
