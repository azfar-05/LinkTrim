import Link from "next/link";
import {
  ArrowRight,
  CalendarClock,
  Check,
  Gauge,
  Link2,
  MousePointerClick,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

import { AnalyticsPreview } from "@/components/analytics-preview";
import { GetStartedButton } from "@/components/get-started-button";
import { HeroDemo } from "@/components/hero-demo";

export default function Home() {
  return (
    <main>
      <Hero />
      <HowItWorks />
      <Features />
      <Analytics />
      <Roles />
      <CTAFooter />
    </main>
  );
}

function DotTexture({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 [background-image:radial-gradient(var(--color-muted-foreground)_1px,transparent_1px)] [background-size:22px_22px] opacity-[0.13] [mask-image:radial-gradient(ellipse_65%_65%_at_50%_45%,black,transparent)] ${className}`}
    />
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden px-4 pb-20 pt-16 sm:pb-24 sm:pt-20">
      <DotTexture />

      <div className="relative mx-auto max-w-3xl text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border bg-card px-3 py-1 text-xs text-muted-foreground shadow-sm">
          <Sparkles className="size-3 text-chart-3" />
          Invite-only early access
        </span>

        <h1 className="mt-6 text-4xl font-bold tracking-tight text-balance sm:text-6xl">
          Shorten everything.
          <br />
          <span className="text-chart-3">Track what matters.</span>
        </h1>

        <p className="mx-auto mt-5 max-w-xl text-pretty text-base text-muted-foreground sm:text-lg">
          An invite-only URL shortener for teams — custom slugs, click caps,
          and bot-free analytics in one shared workspace.
        </p>

        <div className="mt-8">
          <GetStartedButton />
        </div>
      </div>

      <div className="relative">
        <HeroDemo />
      </div>
    </section>
  );
}

const STEPS = [
  {
    title: "Paste",
    desc: "Drop in any long URL — campaigns, checkouts, docs.",
    visual: "https://example.com/campaigns/summer?utm…",
    accent: false,
  },
  {
    title: "Trim",
    desc: "Pick a slug your team will remember, or roll a random one.",
    visual: "→ /sale",
    accent: true,
  },
  {
    title: "Share",
    desc: "Watch clean, bot-free click data land in your dashboard.",
    visual: "linktrim.app/sale",
    accent: true,
  },
];

function HowItWorks() {
  return (
    <section className="border-t px-4 py-16 sm:py-20">
      <div className="mx-auto grid max-w-4xl gap-8 sm:grid-cols-3 sm:gap-6">
        {STEPS.map((step, i) => (
          <div key={step.title} className="relative">
            <div className="flex items-center gap-2.5">
              <h3 className="font-semibold">{step.title}</h3>
              {i < STEPS.length - 1 && (
                <ArrowRight
                  className="hidden size-3.5 text-muted-foreground/50 sm:inline"
                  aria-hidden
                />
              )}
            </div>
            <p
              className={`mt-1.5 inline-block max-w-full truncate rounded-md border px-2 py-1 font-mono text-xs ${
                step.accent
                  ? "border-chart-3/30 bg-chart-3/10 text-chart-3"
                  : "bg-muted/40 text-muted-foreground"
              }`}
            >
              {step.visual}
            </p>
            <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">
              {step.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

const FEATURE_ROWS = [
  {
    icon: Link2,
    title: "Custom & random slugs",
    desc: "Pick a memorable slug like /sale or let LinkTrim generate one. Slug collisions are handled automatically — you always get a working link.",
  },
  {
    icon: CalendarClock,
    title: "Scheduled & expiring",
    desc: "Links activate and retire on dates you choose. Campaigns run themselves; nothing to remember at launch or teardown.",
  },
  {
    icon: Gauge,
    title: "Click caps",
    desc: "Limit total clicks per link for limited offers. The link disables itself the moment the cap is reached — atomically, no oversell.",
  },
  {
    icon: ShieldCheck,
    title: "Bot-filtered analytics",
    desc: "Every visit is classified at redirect time. Crawler traffic is recorded but kept out of your numbers, so what you see is what people clicked.",
  },
];

function Features() {
  return (
    <section className="border-t px-4 py-20 sm:py-24">
      <div className="mx-auto max-w-3xl">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Built-in, not bolted on
        </h2>
        <p className="mt-3 max-w-md text-sm text-muted-foreground">
          The controls most shorteners hide behind upgrades are part of every
          link you create.
        </p>

        <div className="mt-10 divide-y border-y">
          {FEATURE_ROWS.map((row) => (
            <div
              key={row.title}
              className="group flex gap-5 py-7 transition-colors"
            >
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-chart-3/10 transition-colors group-hover:bg-chart-3/15">
                <row.icon className="size-4 text-chart-3" />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold">{row.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {row.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Analytics() {
  return (
    <section className="border-t bg-muted/30 px-4 py-20 sm:py-24">
      <div className="mx-auto max-w-5xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Per-click data, no noise
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Devices, referrers, countries, and peak hours — computed live from
            real visits, not sampled estimates.
          </p>
        </div>

        <div className="mt-12">
          <AnalyticsPreview />
        </div>
      </div>
    </section>
  );
}

const ROLES = [
  {
    badge: "admin",
    icon: ShieldCheck,
    active: true,
    perms: [
      "All links in the organization",
      "Per-member analytics breakdown",
      "Manage settings & invite members",
    ],
  },
  {
    badge: "member",
    icon: Users,
    active: false,
    perms: ["Own links only", "Personal click analytics"],
  },
];

function Roles() {
  return (
    <section className="border-t px-4 py-20 sm:py-24">
      <div className="mx-auto max-w-3xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Two roles, one workspace
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
            Everyone shares the same organization. What you see depends on
            your role.
          </p>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2">
          {ROLES.map((role) => (
            <div
              key={role.badge}
              className={`rounded-xl border p-6 shadow-sm ring-1 ring-foreground/10 ${
                role.active ? "bg-card" : "bg-card/50"
              }`}
            >
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-xs ${
                  role.active
                    ? "border-chart-3/30 bg-chart-3/10 text-chart-3"
                    : "bg-muted/50 text-muted-foreground"
                }`}
              >
                <role.icon className="size-3" />
                {role.badge}
              </span>
              <ul className="mt-5 space-y-2.5 text-sm">
                {role.perms.map((perm) => (
                  <li
                    key={perm}
                    className="flex items-start gap-2 text-muted-foreground"
                  >
                    <Check className="mt-0.5 size-3.5 shrink-0 text-chart-3" />
                    {perm}
                  </li>
                ))}
                {!role.active && (
                  <li className="flex items-start gap-2 text-muted-foreground/50">
                    <span className="mt-0.5">&mdash;</span>
                    Cannot see other members&apos; links
                  </li>
                )}
              </ul>
            </div>
          ))}
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Access is invite-only. New members join as{" "}
          <span className="font-mono text-foreground">member</span> by default.
        </p>
      </div>
    </section>
  );
}

function CTAFooter() {
  return (
    <footer>
      <section className="px-4 pb-20 pt-4 sm:pb-24">
        <div className="relative mx-auto max-w-4xl overflow-hidden rounded-xl border bg-card px-6 py-16 text-center shadow-sm ring-1 ring-foreground/10 sm:py-20">
          <DotTexture />
          <MousePointerClick className="relative mx-auto size-6 text-chart-3" />
          <h2 className="relative mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Your next link is one paste away
          </h2>
          <p className="relative mx-auto mt-3 max-w-md text-sm text-muted-foreground sm:text-base">
            Request access, or sign in if you&apos;re already a member.
          </p>
          <div className="relative mt-8">
            <GetStartedButton />
          </div>
        </div>
      </section>

      <div className="border-t px-4 py-8">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 sm:flex-row">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-semibold"
          >
            <Link2 className="size-4" />
            <span>LinkTrim</span>
          </Link>
          <p className="font-mono text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} LinkTrim
          </p>
        </div>
      </div>
    </footer>
  );
}
